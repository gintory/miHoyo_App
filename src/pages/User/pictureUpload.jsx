import React, { useState, useRef } from 'react';
import { notification, Popconfirm, Modal, Button, Input } from 'antd';
import { PlusCircleFilled, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { request } from '../../network/request';
import { useNavigate } from 'react-router-dom';
import './pictureUpload.css';
import { reject } from 'lodash';

export default function Index(props) {
  const navigate = useNavigate();
  const [test, setTest] = useState([]);
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
    let files = event.target.files;
    [...files].forEach((file, index) => {
      let re = new FileReader();
      re.readAsDataURL(file);
      re.onload = function () {
        let img = new Image();
        img.src = re.result;
        img.onload = function () {
          filterInfo.articlePictures.push({ picFile: file, picUrl: re.result, width: img.width, height: img.height });
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
    let index = list.findIndex((item) => {
      return item.picUrl === showPicUrl;
    });
    if (index != -1) {
      list.splice(index, 1);
    }
    setFilterInfo({ ...filterInfo });
    setShowPicTab(false);
  }
  function handleDeleteImg(item) {
    let url = item.picUrl;
    let list = filterInfo.articlePictures;
    let index = list.findIndex((item) => {
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
  function handleUpload(data) {
    const articleData = {
      articleTitle: data.articleTitle,
      articlePictures: []
    };
    const list = [];
    data.articlePictures.forEach(function (item) {
      let formData = new FormData();
      formData.append('file', item.picFile);
      list.push(
        request({
          url: '/api/uploadPicture',
          method: 'post',
          data: formData
        }).then((res) => {
          if (res.data.data.code === 200) {
            let temp = {
              picFinalUrl: res.data.data.url,
              width: item.width,
              height: item.height
            };
            return temp;
          }
        })
      );
    });
    articleData.articlePictures = list;
    return articleData;
  }
  async function handleSubmit() {
    let data = filterInfo;
    if (data.articleTitle === '' || data.articlePictures.length === 0) {
      notification.error({
        description: '标题或上传的图片不能为空！',
        message: '警告',
        duration: 2
      });
      return;
    }
    setShowLoading(true);
    let res = await handleUpload(data);
    let list = res.articlePictures;
    Promise.all(list)
      .then((listRes) => {
        setShowLoading(false);
        return listRes;
      })
      .then((listRes) => {
        request({
          url: '/api/uploadArticle',
          method: 'post',
          data: {
            userId: Number(localStorage.getItem('userId')),
            articleTitle: res.articleTitle,
            articlePictures: listRes
          }
        }).then((res) => {
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
          setShowBackTab(true);
        });
      });
  }
  function renderSelectedPicture() {
    return filterInfo.articlePictures.map((item, index) => (
      <div className="upload-item" key={item.picUrl + Math.random()}>
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
