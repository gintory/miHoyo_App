import React, { useEffect, useState, useRef } from 'react';
import { Modal, notification, Button, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import './waterFall.css';
import { useMemo } from 'react';
import { divideLine, getPageNum, getMaxPageNum, getRenderData } from '../../utils/common.js';

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
  const waterLineDom = useRef();

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
    let maxPageNum = getMaxPageNum(contentDom, pageSize, imgBoxHeight);
    let lineNum = document.body.clientWidth <= 992 ? 2 : 4;
    if (imgBoxHeight === 0) {
      let LineHeight = waterLineDom.current.offsetHeight;
      imgBoxHeight = LineHeight / (pageSize / lineNum + 1);
    }
    const scrollPageNum = getPageNum(contentDom, {
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
  function renderPicture() {
    const lineDomList = divideLine(dataSource, document.body.clientWidth);
    return (
      <div className="water-list">
        {lineDomList.map((item, index) => {
          return (
            <div className="water-line" ref={waterLineDom} key={index}>
              {generateImgDom(item)}
            </div>
          );
        })}
      </div>
    );
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
