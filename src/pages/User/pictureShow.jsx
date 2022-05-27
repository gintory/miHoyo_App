import React, { useEffect, useState, createRef } from 'react'
import { Modal, Button } from 'antd'
import { request } from '../../network/request'
import './pictureShow.css'
var _ = require('lodash')

export default function PictureShow(props, ref) {
  let pageSize = 20
  let imgBoxHeight = 0
  let [dataSource, setDataSource] = useState([])
  let [showDataSource, setShowDataSource] = useState([])
  let [totalCount, setTotalCount] = useState(0)
  let [totalPages, setTotalPages] = useState(0)
  let [beforeCount, setBeforeCount] = useState(0)
  let [pageNum, setPageNum] = useState(1)
  let [showPicTab, setShowPicTab] = useState(false)
  let [showPicIndex, setShowPicIndex] = useState(0)
  let [showPicUrl, setShowPicUrl] = useState('')
  let scrollRef = createRef()
  let [dom, setDom] = useState(document.getElementById('home_content_main'))

  useEffect(() => {
    dom = document.getElementById('home_content_main')
    if (dom != null) {
      dom.addEventListener('scroll', onScroll)
    }
    getDataSource()
  }, [])
  useEffect(() => {
    if (showDataSource[showPicIndex] != undefined) setShowPicUrl(showDataSource[showPicIndex].picUrl)
  }, [showPicIndex])
  useEffect(() => {
    sliceShowDataSource()
  }, [pageNum, dataSource.length])
  useEffect(() => {
    return () => {
      if (dom != null) dom.removeEventListener('scroll', onScroll)
    }
  }, [])

  async function getDataSource() {
    let source = []
    const res = await request({
      url: '/api/getPicture',
      method: 'get'
    })
    let data = res.data.data
    if (data.code === 200) {
      source = data.content
    }
    setDataSource([...source])
    setTotalCount(source.length)
  }

  function sliceShowDataSource() {
    const { showDataSource, beforeCount, totalCount } = getRenderData({
      pageNum: pageNum,
      pageSize: pageSize,
      dataSource: dataSource
    })
    setShowDataSource(showDataSource)
    setBeforeCount(beforeCount)
    setTotalCount(totalCount)
  }

  const onScroll = () => {
    let maxPageNum = getMaxPageNum()
    if (imgBoxHeight === 0) imgBoxHeight = document.getElementsByClassName('article-temp')[0].offsetHeight
    // console.log('当前scrollTop', dom.scrollTop, imgBoxHeight);
    const scrollPageNum = getPageNum({
      scrollTop: dom.scrollTop,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    })
    const currPageNum = Math.min(scrollPageNum, maxPageNum)
    // console.log(maxPageNum,scrollPageNum,currPageNum,pageNum);
    if (currPageNum === pageNum) return
    setPageNum(currPageNum)
  }

  // 获取最大页数
  function getMaxPageNum() {
    return getPageNum({
      // scrollTop: Math.ceil(totalCount/4)*itemHeight - dom.clientHeight,
      scrollTop: dom.scrollHeight - dom.clientHeight,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    })
  }

  // 计算分页
  function getPageNum({ scrollTop, pageSize, itemHeight }) {
    let num = 4
    if (document.body.clientWidth <= 992) {
      num = 2
    }
    const pageHeight = (pageSize / num) * itemHeight
    return Math.max(Math.ceil((dom.clientHeight + scrollTop) / pageHeight), 1)
  }

  // 数据切片
  function getRenderData({ pageNum, pageSize, dataSource }) {
    const startIndex = (pageNum - 1) * pageSize
    const endIndex = Math.min((pageNum + 0) * pageSize, dataSource.length)
    return {
      showDataSource: dataSource.slice(0, endIndex),
      beforeCount: 0,
      totalCount: dataSource.length
    }
  }

  function returnPicture() {
    return showDataSource.map((item, index) => (
      <div className="article-temp" key={item.picUrl + Math.random()}>
        <div className="article-temp-imgBox" onClick={handleClickImg.bind(null, item, index)}>
          <div className="article-temp-img" style={{ backgroundImage: 'url(' + item.picUrl + ')' }}></div>
        </div>
        <div className="article-title">
          <div className="article-title-content">{item.articleTitle}</div>
        </div>
        <div className="article-userName">
          {item.userName}
          <span className="article-topIcon" style={{ display: parseInt(item.articleType) === 2 ? 'true' : 'none' }}>
            置顶中
          </span>
        </div>
      </div>
    ))
  }

  function handleClickImg(item, index) {
    setShowPicTab(true)
    setShowPicIndex(index)
  }

  function handleChangePic(num) {
    let newIndex = (showPicIndex + num + showDataSource.length) % showDataSource.length
    setShowPicIndex(newIndex)
  }

  function handleCancel() {
    setShowPicTab(false)
  }

  return (
    <div className="picture-show" ref={scrollRef} onScroll={onScroll}>
      <div className="picList">{returnPicture()}</div>
      <Modal
        title="查看图片"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleCancel}>Close</Button>,
          <Button onClick={handleChangePic.bind(null, -1)}>Last</Button>,
          <Button onClick={handleChangePic.bind(null, 1)}>Next</Button>
        ]}
      >
        <div className="article-showPicTab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
    </div>
  )
}
