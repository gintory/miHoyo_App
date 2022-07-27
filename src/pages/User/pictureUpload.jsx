import React, { useState, useRef } from 'react';
import { notification, Popconfirm, Modal, Button, Input } from 'antd';
import { PlusCircleFilled, CloseOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import { useNavigate } from 'react-router-dom';
import './pictureUpload.css';

export default function Index(props) {
  const navigate = useNavigate();
  const [showPicTab, setShowPicTab] = useState(false);
  const [showPicUrl, setShowPicUrl] = useState('');
  const [showBackTab, setShowBackTab] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [filterInfo, setFilterInfo] = useState({
    articleTitle: '',
    articlePictures: []
  });
  const uploadFile = useRef();

  function handleInputChange(event) {
    const value = event.target.value;
    setFilterInfo({ ...filterInfo, [event.target.name]: value });
  }
  function handleClickUploadDiv() {
    uploadFile.current.click();
  }
  function handlePictureChange(event) {
    const files = event.target.files;
    [...files].forEach((file, index) => {
      const re = new FileReader();
      re.readAsDataURL(file);
      re.onload = function () {
        const img = new Image();
        img.src = re.result;
        img.onload = function () {
          const pic = { picFile: file, picUrl: re.result, width: img.width, height: img.height };
          pic.badSize = img.height / img.width > 10 || img.width / img.height > 10 ? true : false;
          filterInfo.articlePictures.push(pic);
          setFilterInfo({ ...filterInfo });
        };
      };
    });
  }
  function handleClickImg(item, index) {
    setShowPicTab(true);
    setShowPicUrl(item.picUrl);
  }
  function handleDelete() {
    let list = filterInfo.articlePictures;
    const index = list.findIndex((item) => {
      return item.picUrl === showPicUrl;
    });
    if (index != -1) {
      list.splice(index, 1);
    }
    setFilterInfo({ ...filterInfo });
    setShowPicTab(false);
  }
  function handleDeleteImg(item) {
    const url = item.picUrl;
    let list = filterInfo.articlePictures;
    const index = list.findIndex((item) => {
      return item.picUrl === url;
    });
    if (index !== -1) {
      list.splice(index, 1);
    }
    setFilterInfo({ ...filterInfo });
  }
  function handleCancel() {
    setShowPicTab(false);
  }
  function handleBackCancel() {
    setShowBackTab(false);
    navigate('/home/picture-show');
  }
  function handleBack() {
    setShowBackTab(false);
  }
  async function handleSubmit() {
    const data = { ...filterInfo };
    const findPic = data.articlePictures.findIndex((item) => item.badSize === true);
    if (data.articleTitle === '' || data.articlePictures.length === 0) {
      notification.error({
        description: '标题或上传的图片不能为空！',
        message: '警告',
        duration: 2
      });
      return;
    }
    if (findPic !== -1) {
      notification.error({
        description: '存在比例异常图片！',
        message: '警告',
        duration: 2
      });
      return;
    }
    setShowLoading(true);
    let formData = new FormData();
    data.articlePictures.forEach((item) => {
      formData.append('file', item.picFile);
    });
    request({
      url: '/api/uploadPhoto',
      method: 'post',
      data: formData
    }).then((res) => {
      if (res.data.data.code === 200) {
        const list = data.articlePictures.map((item, index) => {
          return { picFinalUrl: res.data.data.url[index], width: item.width, height: item.height };
        });
        request({
          url: '/api/uploadArticle',
          method: 'post',
          data: {
            userId: Number(localStorage.getItem('userId')),
            articleTitle: data.articleTitle,
            articlePictures: list
          }
        }).then((res) => {
          setShowLoading(false);
          setShowBackTab(true);
          setFilterInfo({
            articleTitle: '',
            articlePictures: []
          });
          notification.success({
            description: '发布成功！',
            message: '通知',
            duration: 2,
            onClose: () => {}
          });
        });
      }
    });
  }
  function renderSelectedPicture() {
    return filterInfo.articlePictures.map((item, index) => (
      <div className="upload-item" key={item.picUrl + Math.random()}>
        <div className="btn-info" style={{ display: item.badSize ? 'block' : 'none' }}>
          <ExclamationCircleOutlined />
        </div>
        <div className="upload-item-box" onClick={() => handleClickImg(item, index)}>
          <div className="upload-item-image" style={{ backgroundImage: `url(${item.picUrl})` }}></div>
        </div>
        <Popconfirm
          placement="top"
          title="确认删除这张图片吗?"
          onConfirm={() => handleDeleteImg(item)}
          okText="Yes"
          cancelText="No"
        >
          <div className="btn-delete">
            <CloseOutlined />
          </div>
        </Popconfirm>
      </div>
    ));
  }

  return (
    <div className="picture-upload">
      <div className="upload-content">
        <div className="upload-header">发表图片</div>
        <div className="upload-form">
          <div className="form-input">
            <div className="form-span">标题：</div>
            <Input
              className="form-input-item"
              placeholder="标题(必填)"
              value={filterInfo.articleTitle}
              onChange={handleInputChange}
              name="articleTitle"
            ></Input>
          </div>
          <div className="form-pictures">
            <div className="form-span">上传图片：</div>
            <div className="form-upload-box">
              {renderSelectedPicture()}
              <div className="form-upload" onClick={handleClickUploadDiv}>
                <div className="form-upload-content">
                  <div className="btn-add">
                    <PlusCircleFilled />
                  </div>
                  <p className="btn-add-text">点击添加图片</p>
                  <p>最多可同时上传10张(支持格式jpg、png、jpeg、gif)</p>
                  <div className="btn-upload">
                    <input
                      ref={uploadFile}
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
          <Popconfirm
            key="confirm-delete"
            placement="top"
            title="确认删除吗?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">删除</Button>
          </Popconfirm>,
          <Button key="cancel-delete" onClick={handleCancel}>
            关闭
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
      <Modal title="图片上传中" style={{ textAlign: 'center' }} visible={showLoading} footer={null}>
        <LoadingOutlined />
      </Modal>
      <Modal
        title="发布成功"
        visible={showBackTab}
        onCancel={handleBackCancel}
        footer={[
          <Button key="submit-back" type="primary" onClick={handleBack}>
            是的
          </Button>,
          <Button key="submit-end" onClick={handleBackCancel}>
            不了，谢谢
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <p>是否要继续上传图片？</p>
        </div>
      </Modal>
    </div>
  );
}
