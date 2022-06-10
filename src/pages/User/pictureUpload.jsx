import React, { useState } from 'react'
import { notification, Popconfirm, Modal, Button, Input } from 'antd'
import { PlusCircleFilled, CloseOutlined } from '@ant-design/icons'
import { request } from '../../network/request'
import { useNavigate } from 'react-router-dom'
import './pictureUpload.css';

export default function Index(props) {
  const navigate = useNavigate();
  const [showPicTab, setShowPicTab] = useState(false);
  const [showPicUrl, setShowPicUrl] = useState('');
  const [showBackTab, setShowBackTab] = useState(false);
  const [filterInfo, setFilterInfo] = useState({
    articleTitle: '',
    articlePictures: []
  });

  function renderSelectedPicture() {
    return filterInfo.articlePictures.map((item, index) => (
      <div className="uploadImg" key={item.picUrl + Math.random()}>
        <div className="uploadImg-imgBox" onClick={() => handleClickImg(item, index)}>
          <div className="uploadImg-image" style={{ backgroundImage: 'url(' + item.picUrl + ')' }}></div>
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
  function handleInputChange(event) {
    const value = event.target.value;
    setFilterInfo({ ...filterInfo, [event.target.name]: value });
  }
  function handleClickUploadDiv() {
    document.getElementById('upload_file').click();
  }
  function handlePictureChange(event) {
    let files = event.target.files;
    let list = filterInfo.articlePictures;
    [...files].forEach((file, index) => {
      let re = new FileReader();
      re.readAsDataURL(file);
      re.onload = function () {
        let img = new Image();
        img.src = re.result;
        img.onload = function () {
          list.push({ picFile: file, picUrl: re.result, width: img.width, height: img.height });
          setFilterInfo({ ...filterInfo, ['articlePictures']: list });
        };
      };
    });
  }
  function handleClickImg(item, index) {
    setShowPicTab(true);
    setShowPicUrl(item.picUrl);
  }
  function handleDelete() {
    let url = showPicUrl;
    let list = filterInfo.articlePictures;
    let index = list.indexOf((item) => {
      return item.picUrl === url;
    });
    list.splice(index, 1);
    setFilterInfo({ ...filterInfo, ['articlePictures']: list });
    setShowPicTab(false);
  }
  function handleDeleteImg(item) {
    let url = item.picUrl;
    let list = filterInfo.articlePictures;
    let index = list.findIndex((item) => {
      return item.picUrl === url;
    });
    list.splice(index, 1);
    setFilterInfo({ ...filterInfo, ['articlePictures']: list });
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
    data.articlePictures.map(function (item) {
      let formData = new FormData();
      formData.append('file', item.picFile);
      list.push(
        new Promise((resolve, reject) => {
          request({
            url: '/api/uploadPicture',
            method: 'post',
            data: formData
          }).then((res) => {
            if (res.data.data.code === 200) {
              console.log('here');
              let temp = {
                picFinalUrl: res.data.data.url,
                width: item.width,
                height: item.height
              };
              resolve(temp);
            }
          });
        })
      );
    });

    articleData.articlePictures = list;
    return articleData;
  }
  async function handleSubmit() {
    let data = filterInfo;
    if (data.articleTitle === '' || data.articlePictures.lenght === 0) {
      notification.error({
        description: '标题或上传的图片不能为空！',
        message: '警告',
        duration: 2
      });
      return;
    }
    let res = await handleUpload(data);
    let list = res.articlePictures;
    Promise.all(list).then((listRes) => {
      console;
      request({
        url: '/api/uploadArticle',
        method: 'post',
        data: {
          userId: Number(localStorage.getItem('userId')),
          articleTitle: res.articleTitle,
          articlePictures: listRes
        }
      });
    });
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
  }

  return (
    <div className="picture-upload">
      <div className="upload-content">
        <div className="upload-header">发表图片</div>
        <div className="upload-form">
          <div className="form-input">
            <div className="form-span" style={{ width: 50 }}>
              标题：
            </div>
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
              {renderSelectedPicture()}
              <div className="form-upload" style={{ backgroundColor: '#f5f5f5' }} onClick={handleClickUploadDiv}>
                <div className="form-upload-content">
                  <div className="btn-add">
                    <PlusCircleFilled />
                  </div>
                  <p style={{ color: '#000', fontSize: '16px' }}>点击添加图片</p>
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
          <Popconfirm
            key="confirm-delete"
            placement="top"
            title="确认删除吗?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>,
          <Button key="cancel-delete" onClick={handleCancel}>
            Close
          </Button>
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
          <Button key="submit-back" type="primary" onClick={handleBack}>
            是的
          </Button>,
          <Button key="submit-end" onClick={handleBackCancel}>
            不了，谢谢
          </Button>
        ]}
      >
        <div className="article-showPicTab">
          <p>是否要继续上传图片？</p>
        </div>
      </Modal>
    </div>
  );
}
