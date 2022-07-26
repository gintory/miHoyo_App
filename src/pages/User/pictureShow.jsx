import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import './pictureShow.css';
import { getPageNum, getMaxPageNum, getRenderData } from '../../utils/common.js';
const pageSize = 20;
const LoadingImg = new Image();
LoadingImg.src = '../assets/loading.gif';

export default function PictureShow(props) {
  let imgBoxHeight = 0;
  let contentDom = document.getElementById('home-content-main');
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
  const articleContent = useRef();
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
    showDataSource.length === dataSource.length ? setShowBottomText('true') : setShowBottomText('false');
  }, [showDataSource.length]);
  useEffect(() => {
    const loadedLength = showPicSource.length;
    let arr = [...showPicSource];
    arr.length = showDataSource.length;
    arr = arr.fill('../assets/loading.gif', loadedLength);
    setShowPicSource([...arr]);
    for (let i = loadedLength; i < showDataSource.length; i++) {
      const item = showDataSource[i];
      const img = new Image();
      img.src = item.picUrl;
      img.onload = function () {
        arr[i] = item.picUrl;
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
    const maxPageNum = getMaxPageNum(contentDom, pageSize, imgBoxHeight);
    if (imgBoxHeight === 0 && articleContent.current) {
      imgBoxHeight = articleContent.current.offsetHeight;
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
    setShowPicTab(true);
    setShowPicIndex(index);
    setShowPicUrl(showDataSource[index].picUrl);
  }
  function handleChangePic(num) {
    const newIndex = (showPicIndex + num + showDataSource.length) % showDataSource.length;
    setShowPicIndex(newIndex);
    setShowPicUrl(showDataSource[newIndex].picUrl);
  }
  function handleCancel() {
    setShowPicTab(false);
  }
  function renderPicture() {
    return showDataSource.map((item, index) => (
      <div className="article-temp" key={item.picUrl + Math.random()} ref={articleContent}>
        <div className="article-temp-box" onClick={() => handleClickImg(item, index)}>
          <div className="article-temp-img" style={{ backgroundImage: `url(${showPicSource[index]})` }}></div>
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
    <div className="picture-show">
      <LoadingOutlined ref={loading} className="loading" />
      <div className="pic-list">{renderPicture()}</div>
      <p className="bottom-text" visible={showBottomText}>
        没有更多数据了~
      </p>
      <Modal
        title="查看图片"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Button key="click-modal-last" onClick={() => handleChangePic(-1)}>
            上一张
          </Button>,
          <Button key="click-modal-next" onClick={() => handleChangePic(1)}>
            下一张
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
