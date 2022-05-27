import React, { useEffect, useState } from 'react'
import { Modal, notification, Button, Input } from 'antd'
import { request } from '../../network/request'
import './waterFall.css'

export default function WaterFall(props) {
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
  let [dom, setDom] = useState(document.getElementById('home_content_main'))

  useEffect(() => {
    dom = document.getElementById('home_content_main')
    if (dom != null) {
      dom.addEventListener('scroll', onScroll)
    }
    getDataSource()
  }, [])
  //以下为原有
  useEffect(() => {
    if (dataSource.length > 0) {
      setShowPicUrl(dataSource[showPicIndex].picUrl)
    }
  }, [showPicIndex])
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
    let num = 4
    if (document.body.clientWidth <= 992) {
      num = 2
    }
    // if(imgBoxHeight === 0) imgBoxHeight = document.getElementsByClassName('articleTemp')[0].offsetHeight
    if (imgBoxHeight === 0) {
      let linedom = document.getElementsByClassName('waterline')
      let LineHeight = linedom[0].offsetHeight
      imgBoxHeight = LineHeight / (pageSize / num + 1)
    }
    // console.log('当前scrollTop', dom.scrollTop, imgBoxHeight)
    const scrollPageNum = getPageNum({
      scrollTop: dom.scrollTop,
      pageSize: pageSize,
      itemHeight: imgBoxHeight
    })
    const currPageNum = Math.min(scrollPageNum, maxPageNum)
    // console.log(maxPageNum,scrollPageNum,currPageNum,pageNum);
    if (currPageNum === pageNum) return
    // console.log('next page')
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

  //瀑布流根据图片高度布局
  function returnPicture() {
    if (document.body.clientWidth >= 992) {
      let heightList = [0, 0, 0, 0]
      let lineDomList = [[], [], [], []]
      let lineIndex = 0
      let img = new Image()
      showDataSource.map((item, index) => {
        lineIndex = getMin(heightList)
        img.src = item.picUrl
        heightList[lineIndex] = heightList[lineIndex] + (item.picHeight / item.picWidth) * 253 + 84
        lineDomList[lineIndex].push(item)
      })
      return (
        <div className="waterlist">
          <div className="waterline">{generateImgDom(lineDomList[0])}</div>
          <div className="waterline">{generateImgDom(lineDomList[1])}</div>
          <div className="waterline">{generateImgDom(lineDomList[2])}</div>
          <div className="waterline">{generateImgDom(lineDomList[3])}</div>
        </div>
      )
    } else {
      let lineDomList = [[], []]
      let heightList = [0, 0]
      let lineIndex = 0
      let img = new Image()
      showDataSource.map((item, index) => {
        lineIndex = getMin(heightList)
        img.src = item.picUrl
        heightList[lineIndex] = heightList[lineIndex] + (item.picHeight / item.picWidth) * 253 + 84
        lineDomList[lineIndex].push(item)
      })
      return (
        <div className="waterlist">
          <div className="waterline">{generateImgDom(lineDomList[0])}</div>
          <div className="waterline">{generateImgDom(lineDomList[1])}</div>
        </div>
      )
    }
  }

  function generateImgDom(list) {
    return list.map((item, index) => (
      <div className="water-article-temp" key={item.picUrl + Math.random()}>
        <div className="water-imgBox" onClick={handleClickImg.bind(null, item, index)}>
          <img className="water-article-img" src={item.picUrl}></img>
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

  function getMin(arr) {
    let newarr = [...arr]
    newarr.sort((a, b) => a - b)
    return arr.indexOf(newarr[0])
  }

  function handleClickImg(item, index) {
    setShowPicTab(true)
    setShowPicIndex(dataSource.indexOf(item))
  }

  function handleChangePic(num) {
    let newIndex = (showPicIndex + num + dataSource.length) % dataSource.length
    setShowPicIndex(newIndex)
  }

  function handleCancel() {
    setShowPicTab(false)
  }

  return (
    <div className="waterfall">
      {returnPicture()}
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
