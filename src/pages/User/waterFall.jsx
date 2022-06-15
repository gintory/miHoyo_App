import React, { useEffect, useState, useRef } from 'react';
import { Modal, notification, Button, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import './waterFall.css';

export default function WaterFall(props) {
  const pageSize = 20;
  let imgBoxHeight = 0;
  let contentDom = document.getElementById('home-content-main');
  const [dataSource, setDataSource] = useState([]);
  const [showDataSource, setShowDataSource] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [beforeCount, setBeforeCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [showPicTab, setShowPicTab] = useState(false);
  const [showPicIndex, setShowPicIndex] = useState(0);
  const [showPicUrl, setShowPicUrl] = useState('');
  const loading = useRef();

  useEffect(() => {
    contentDom = document.getElementById('home-content-main');
    if (contentDom) {
      contentDom.addEventListener('scroll', onScroll);
    }
    getDataSource();
  }, []);
  useEffect(() => {
    if (dataSource.length > 0) {
      setShowPicUrl(dataSource[showPicIndex].picUrl);
    }
  }, [showPicIndex]);
  useEffect(() => {
    if (showDataSource[showPicIndex]) {
      setShowPicUrl(showDataSource[showPicIndex].picUrl);
    }
  }, [showPicIndex]);
  useEffect(() => {
    sliceShowDataSource();
  }, [pageNum, dataSource.length]);
  useEffect(() => {
    return () => {
      if (contentDom != null) {
        contentDom.removeEventListener('scroll', onScroll);
      }
    };
  }, []);

  function getDataSource() {
    request({
      url: '/api/getPicture',
      method: 'get'
    }).then((val) => {
      let data = val.data.data;
      if (data.code === 200) {
        setDataSource([...data.content]);
        setTotalCount(data.content.length);
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
    let lineNum = 4;
    if (document.body.clientWidth <= 992) {
      lineNum = 2;
    }
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
    setShowPicTab(true);
  }
  function handleChangePic(num) {
    let newIndex = (showPicIndex + num + dataSource.length) % dataSource.length;
    setShowPicIndex(newIndex);
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
      showDataSource.map((item, index) => {
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
      showDataSource.map((item, index) => {
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
          <img className="water-article-img" src={item.picUrl}></img>
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
          <Button key="show-back" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="show-last" onClick={() => handleChangePic(-1)}>
            Last
          </Button>,
          <Button key="show-next" onClick={() => handleChangePic(1)}>
            Next
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
    </div>
  );
}
