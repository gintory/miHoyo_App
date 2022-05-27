import React, { useState } from 'react'
import { notification, Popconfirm, Modal, Button, Input } from 'antd'
import { PlusCircleFilled, CloseOutlined } from '@ant-design/icons'
import { request } from '../../network/request'
import { useNavigate } from 'react-router-dom'
import './pictureUpload.css'
var _ = require('lodash')

export default function Index(props) {
  const navigate = useNavigate()
  let [showPicTab, setShowPicTab] = useState(false)
  let [showPicUrl, setShowPicUrl] = useState('')
  let [showBackTab, setShowBackTab] = useState(false)
  const [filterInfo, setFilterInfo] = useState({
    articleTitle: '',
    articlePictures: []
  })

  function returnPic() {
    return filterInfo.articlePictures.map((item, index) => (
      <div className="uploadImg" key={item.picUrl + Math.random()}>
        <div className="uploadImg-imgBox" onClick={handleClickImg.bind(null, item, index)}>
          <div className="uploadImg-image" style={{ backgroundImage: 'url(' + item.picUrl + ')' }}></div>
        </div>
        <Popconfirm
          placement="top"
          title="确认删除这张图片吗?"
          onConfirm={handleDeleteImg.bind(null, item)}
          okText="Yes"
          cancelText="No"
        >
          <div className="btn-delete" onClick={handleDelete}>
            <CloseOutlined />
          </div>
        </Popconfirm>
      </div>
    ))
  }
  function handleInputChange(event) {
    const value = event.target.value
    setFilterInfo({ ...filterInfo, [event.target.name]: value })
  }
  function handleClickUploadDiv() {
    document.getElementById('upload_file').click()
  }
  function handlePictureChange(event) {
    let files = event.target.files
    let list = filterInfo.articlePictures
    _.forEach(files, (file, index) => {
      let re = new FileReader()
      re.readAsDataURL(file)
      re.onload = function () {
        let img = new Image()
        img.src = re.result
        img.onload = function () {
          list.push({ picFile: file, picUrl: re.result, width: img.width, height: img.height })
          setFilterInfo({ ...filterInfo, ['articlePictures']: list })
        }
      }
    })
  }
  function handleClickImg(item, index) {
    setShowPicTab(true)
    setShowPicUrl(item.picUrl)
  }
  function handleDelete() {
    let url = showPicUrl
    let list = filterInfo.articlePictures
    let index = _.findIndex(list, (item) => {
      return item.picUrl == url
    })
    _.pullAt(list, index)
    setFilterInfo({ ...filterInfo, ['articlePictures']: list })
    setShowPicTab(false)
  }
  function handleDeleteImg(item) {
    let url = item.picUrl
    let list = filterInfo.articlePictures
    let index = _.findIndex(list, (item) => {
      return item.picUrl == url
    })
    _.pullAt(list, index)
    setFilterInfo({ ...filterInfo, ['articlePictures']: list })
  }
  function handleCancel() {
    setShowPicTab(false)
  }
  function handleBackCancel() {
    setShowBackTab(false)
    navigate('/home/picture-show')
  }
  function handleBack() {
    setShowBackTab(false)
  }
  async function handleUpload(data) {
    let articleData = {
      articleTitle: data.articleTitle,
      articlePictures: []
    }
    let list = []
    _.map(data.articlePictures, async function (item) {
      let formData = new FormData()
      formData.append('file', item.picFile)
      list.push(
        new Promise((resolve, reject) => {
          request({
            url: '/api/uploadPicture',
            method: 'post',
            data: formData
          }).then((res) => {
            if (res.data.data.code === 200) {
              console.log('图片上传成功！')
              let temp = {
                picFinalUrl: res.data.data.url,
                width: item.width,
                height: item.height
              }
              resolve(temp)
            }
          })
        })
      )
    })

    articleData.articlePictures = list
    return articleData
  }
  async function handleSubmit() {
    let data = filterInfo
    if (data.articleTitle == '' || data.articlePictures.lenght === 0) {
      notification.error({
        description: '标题或上传的图片不能为空！',
        message: '警告',
        duration: 2
      })
      return
    }
    data = await handleUpload(data)
    console.log(data)
    let list = data.articlePictures
    Promise.all(list).then(async function (listRes) {
      let res = await request({
        url: '/api/uploadArticle',
        method: 'post',
        data: {
          userId: localStorage.getItem('userId'),
          articleTitle: data.articleTitle,
          articlePictures: listRes
        }
      })
      console.log(res)
      if (res.data.data.code === 200) {
        setFilterInfo({
          articleTitle: '',
          articlePictures: []
        })
        setShowBackTab(true)
        notification.success({
          description: '发布成功！',
          message: '通知',
          duration: 2,
          onClose: () => {}
        })
      }
    })
  }

  return (
    <div className="picture-upload">
      <div className="upload-content">
        <div className="upload-header">发表图片</div>
        <div className="upload-form">
          <div className="form-input">
            <div className="form-span">标题：</div>
            <Input
              placeholder="标题(必填)"
              value={filterInfo.articleTitle}
              onChange={handleInputChange}
              name="articleTitle"
            ></Input>
          </div>
          <div className="form-pictures">
            <div className="form-span">上传图片：</div>
            <div className="form-uploadBox">
              {returnPic()}
              <div className="form-upload" onClick={handleClickUploadDiv}>
                <div className="form-upload-content">
                  <div className="btn-add">
                    <PlusCircleFilled />
                  </div>
                  <p style={{ color: '#000000', fontSize: '16px' }}>点击添加图片</p>
                  <p>最多可同时上传10张(支持格式jpg、png、jpeg、gif)</p>
                  <div className="btn-upload">
                    <input
                      id="upload_file"
                      type="file"
                      multiple="multiple"
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      onChange={handlePictureChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="form-btn">
          <Button type="primary" className="form-btn" onClick={handleSubmit}>
            发布
          </Button>
        </div>
      </div>
      <Modal
        title="查看图片"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Popconfirm placement="top" title="确认删除吗?" onConfirm={handleDelete} okText="Yes" cancelText="No">
            <Button type="danger">Delete</Button>
          </Popconfirm>,
          <Button onClick={handleCancel}>Close</Button>
        ]}
      >
        <div className="article-showPicTab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
      <Modal
        title="发布成功"
        visible={showBackTab}
        onCancel={handleBackCancel}
        footer={[
          <Button type="primary" onClick={handleBack}>
            是的
          </Button>,
          <Button onClick={handleBackCancel}>不了，谢谢</Button>
        ]}
      >
        <div className="article-showPicTab">
          <p>是否要继续上传图片？</p>
        </div>
      </Modal>
    </div>
  )
}
