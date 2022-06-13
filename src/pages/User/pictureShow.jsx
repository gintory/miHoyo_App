import React, { useEffect, useState, createRef, useRef } from 'react';
import { Modal, Button } from 'antd';
import { request } from '../../network/request';
import './pictureShow.css';

export default function PictureShow(props, ref) {
  const pageSize = 12;
  let imgBoxHeight = 0;
  let contentDom = document.getElementById('home-content-main');
  const [dataSource, setDataSource] = useState([]);
  const [showDataSource, setShowDataSource] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [beforeCount, setBeforeCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [showPicTab, setShowPicTab] = useState(false);
  const [showPicIndex, setShowPicIndex] = useState(0);
  const [showPicUrl, setShowPicUrl] = useState('');
  const scrollRef = createRef();
  const articleContent = useRef();

  useEffect(() => {
    contentDom = document.getElementById('home-content-main');
    if (contentDom != null) {
      contentDom.addEventListener('scroll', onScroll);
    }
    getDataSource();
  }, []);
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
    if (imgBoxHeight === 0) {
      imgBoxHeight = articleContent.current.offsetHeight;
    }
    // console.log('当前scrollTop', contentDom.scrollTop, imgBoxHeight);
    const scrollPageNum = getPageNum({
      scrollTop: contentDom.scrollTop,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    });
    const currPageNum = Math.min(scrollPageNum, maxPageNum);
    // console.log(maxPageNum,scrollPageNum,currPageNum,pageNum);
    if (currPageNum === pageNum) {
      return;
    }
    setPageNum(currPageNum);
  };

  // 获取最大页数
  function getMaxPageNum() {
    return getPageNum({
      // scrollTop: Math.ceil(totalCount/4)*itemHeight - contentDom.clientHeight,
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

  function returnPicture() {
    return showDataSource.map((item, index) => (
      <div className="article-temp" key={item.picUrl + Math.random()} ref={articleContent}>
        <div className="article-temp-box" onClick={() => handleClickImg(item, index)}>
          <div className="article-temp-img" style={{ backgroundImage: 'url(' + item.picUrl + ')' }}></div>
        </div>
        <div className="article-title">
          <div className="article-title-content">{item.articleTitle}</div>
        </div>
        <div className="article-userName">
          {item.userName}
          <span className="article-topIcon" style={{ display: Number(item.articleType) === 2 ? 'true' : 'none' }}>
            置顶中
          </span>
        </div>
      </div>
    ));
  }

  function handleClickImg(item, index) {
    setShowPicTab(true);
    setShowPicIndex(index);
  }

  function handleChangePic(num) {
    const newIndex = (showPicIndex + num + showDataSource.length) % showDataSource.length;
    setShowPicIndex(newIndex);
  }

  function handleCancel() {
    setShowPicTab(false);
  }

  return (
    <div className="picture-show" ref={scrollRef} onScroll={onScroll}>
      <div className="picList">{returnPicture()}</div>
      <Modal
        title="查看图片"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Button key="close-modal" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="click-modal-last" onClick={() => handleChangePic(-1)}>
            Last
          </Button>,
          <Button key="click-modal-next" onClick={() => handleChangePic(1)}>
            Next
          </Button>
        ]}
      >
        <div className="article-showPicTab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
    </div>
  );
}
