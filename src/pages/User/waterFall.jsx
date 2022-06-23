import React, { useEffect, useState, useRef } from 'react';
import { Modal, notification, Button, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import './waterFall.css';
import { useMemo } from 'react';

export default function WaterFall(props) {
  const pageSize = 20;
  let imgBoxHeight = 0;
  let contentDom = document.getElementById('home-content-main');
  let LoadingImg = new Image();
  LoadingImg.src = '../assets/loading.gif';
  const [dataSource, setDataSource] = useState([]);
  const [showDataSource, setShowDataSource] = useState([]);
  const [showPicSource, setShowPicSource] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [beforeCount, setBeforeCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [showPicTab, setShowPicTab] = useState(false);
  const [showBottomText, setShowBottomText] = useState('false');
  const [showPicIndex, setShowPicIndex] = useState(0);
  const [showPicUrl, setShowPicUrl] = useState('');
  const loading = useRef();

  useEffect(() => {
    contentDom = document.getElementById('home-content-main');
    if (contentDom) {
      contentDom.addEventListener('scroll', onScroll);
    }
    getDataSource();
    return () => {
      if (contentDom !== null) {
        contentDom.removeEventListener('scroll', onScroll);
      }
    };
  }, []);
  useEffect(() => {
    sliceShowDataSource();
  }, [pageNum, dataSource.length]);
  useEffect(() => {
    if (showDataSource.length === dataSource.length) {
      setShowBottomText('true');
    } else {
      setShowBottomText('false');
    }
  }, [showDataSource.length]);
  useMemo(() => {
    let loadedLength = showPicSource.length;
    let arr = [...showDataSource];
    for (let i = 0; i < loadedLength; i++) {
      arr[i].loadingUrl = showPicSource[i].loadingUrl;
    }
    for (let i = loadedLength; i < arr.length; i++) {
      arr[i].loadingUrl = '../assets/loading.gif';
    }
    setShowPicSource([...arr]);
    for (let i = loadedLength; i < showDataSource.length; i++) {
      let item = showDataSource[i];
      let img = new Image();
      img.src = item.picUrl;
      img.onload = function () {
        arr[i].loadingUrl = item.picUrl;
        setShowPicSource([...arr]);
      };
    }
  }, [showDataSource]);

  function getDataSource() {
    request({
      url: '/api/getPicture',
      method: 'get'
    }).then((val) => {
      if (val.data.data.code === 200) {
        setDataSource([...val.data.data.content]);
        setTotalCount(val.data.data.content.length);
        loading.current.style.display = 'none';
      }
    });
  }
  function sliceShowDataSource() {
    const { showDataSource, beforeCount, totalCount } = getRenderData({
      pageNum: pageNum,
      pageSize: pageSize,
      dataSource: dataSource
    });
    setShowDataSource(showDataSource);
    setBeforeCount(beforeCount);
    setTotalCount(totalCount);
  }
  const onScroll = () => {
    let maxPageNum = getMaxPageNum();
    let num = 4;
    if (document.body.clientWidth <= 992) {
      num = 2;
    }
    if (imgBoxHeight === 0) {
      let lineDom = document.getElementsByClassName('water-line');
      let LineHeight = lineDom[0].offsetHeight;
      imgBoxHeight = LineHeight / (pageSize / num + 1);
    }
    const scrollPageNum = getPageNum({
      scrollTop: contentDom.scrollTop,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    });
    const currPageNum = Math.min(scrollPageNum, maxPageNum);
    if (currPageNum === pageNum) {
      return;
    }
    setPageNum(currPageNum);
  };
  // 获取最大页数
  function getMaxPageNum() {
    return getPageNum({
      scrollTop: contentDom.scrollHeight - contentDom.clientHeight,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    });
  }
  // 计算分页
  function getPageNum({ scrollTop, pageSize, itemHeight }) {
    let lineNum = document.body.clientWidth <= 992 ? 2 : 4;
    const pageHeight = (pageSize / lineNum) * itemHeight;
    return Math.max(Math.ceil((contentDom.clientHeight + scrollTop) / pageHeight), 1);
  }
  function getMin(arr) {
    let newArr = [...arr];
    newArr.sort((a, b) => a - b);
    return arr.indexOf(newArr[0]);
  }
  function handleClickImg(item, index) {
    setShowPicIndex(dataSource.indexOf(item));
    setShowPicUrl(dataSource[dataSource.indexOf(item)].picUrl);
    setShowPicTab(true);
  }
  function handleChangePic(num) {
    let newIndex = (showPicIndex + num + dataSource.length) % dataSource.length;
    setShowPicIndex(newIndex);
    setShowPicUrl(dataSource[newIndex].picUrl);
  }
  function handleCancel() {
    setShowPicTab(false);
  }
  // 数据切片
  function getRenderData({ pageNum, pageSize, dataSource }) {
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = Math.min((pageNum + 0) * pageSize, dataSource.length);
    return {
      showDataSource: dataSource.slice(0, endIndex),
      beforeCount: 0,
      totalCount: dataSource.length
    };
  }
  //瀑布流根据图片高度布局
  function renderPicture() {
    if (document.body.clientWidth >= 992) {
      let heightList = [0, 0, 0, 0];
      let lineDomList = [[], [], [], []];
      let lineIndex = 0;
      showPicSource.map((item, index) => {
        lineIndex = getMin(heightList);
        heightList[lineIndex] = heightList[lineIndex] + (item.picHeight / item.picWidth) * 253 + 84;
        lineDomList[lineIndex].push(item);
      });
      return (
        <div className="water-list">
          <div className="water-line">{generateImgDom(lineDomList[0])}</div>
          <div className="water-line">{generateImgDom(lineDomList[1])}</div>
          <div className="water-line">{generateImgDom(lineDomList[2])}</div>
          <div className="water-line">{generateImgDom(lineDomList[3])}</div>
        </div>
      );
    } else {
      let lineDomList = [[], []];
      let heightList = [0, 0];
      let lineIndex = 0;
      showPicSource.map((item, index) => {
        lineIndex = getMin(heightList);
        heightList[lineIndex] = heightList[lineIndex] + (item.picHeight / item.picWidth) * 253 + 84;
        lineDomList[lineIndex].push(item);
      });
      return (
        <div className="water-list">
          <div className="water-line">{generateImgDom(lineDomList[0])}</div>
          <div className="water-line">{generateImgDom(lineDomList[1])}</div>
        </div>
      );
    }
  }
  function generateImgDom(list) {
    return list.map((item, index) => (
      <div className="water-article-temp" key={item.picUrl + Math.random()}>
        <div className="water-box" onClick={() => handleClickImg(item, index)}>
          <img className="water-article-img" src={item.loadingUrl}></img>
        </div>
        <div className="article-title">
          <div className="article-title-content">{item.articleTitle}</div>
        </div>
        <div className="article-user-name">
          {item.userName}
          <span className="article-icon-top" style={{ display: Number(item.articleType) === 2 ? 'true' : 'none' }}>
            置顶中
          </span>
        </div>
      </div>
    ));
  }

  return (
    <div className="waterfall">
      <LoadingOutlined ref={loading} className="loading" />
      {renderPicture()}
      <Modal
        title="查看图片"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          // <Button key="show-back" onClick={handleCancel}>
          //   关闭
          // </Button>,
          <Button key="show-last" onClick={() => handleChangePic(-1)}>
            上一张
          </Button>,
          <Button key="show-next" onClick={() => handleChangePic(1)}>
            下一张
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
      <p className="bottom-text" visible={showBottomText}>
        没有更多数据了~
      </p>
    </div>
  );
}
