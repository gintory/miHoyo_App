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
        description: '???????????????????????????????????????',
        message: '??????',
        duration: 2
      });
      return;
    }
    if (findPic !== -1) {
      notification.error({
        description: '???????????????????????????',
        message: '??????',
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
            description: '???????????????',
            message: '??????',
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
          title="????????????????????????????"
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
        <div className="upload-header">????????????</div>
        <div className="upload-form">
          <div className="form-input">
            <div className="form-span">?????????</div>
            <Input
              className="form-input-item"
              placeholder="??????(??????)"
              value={filterInfo.articleTitle}
              onChange={handleInputChange}
              name="articleTitle"
            ></Input>
          </div>
          <div className="form-pictures">
            <div className="form-span">???????????????</div>
            <div className="form-upload-box">
              {renderSelectedPicture()}
              <div className="form-upload" onClick={handleClickUploadDiv}>
                <div className="form-upload-content">
                  <div className="btn-add">
                    <PlusCircleFilled />
                  </div>
                  <p className="btn-add-text">??????????????????</p>
                  <p>?????????????????????10???(????????????jpg???png???jpeg???gif)</p>
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
            ??????
          </Button>
        </div>
      </div>
      <Modal
        title="????????????"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Popconfirm
            key="confirm-delete"
            placement="top"
            title="????????????????"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">??????</Button>
          </Popconfirm>,
          <Button key="cancel-delete" onClick={handleCancel}>
            ??????
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
      <Modal title="???????????????" style={{ textAlign: 'center' }} visible={showLoading} footer={null}>
        <LoadingOutlined />
      </Modal>
      <Modal
        title="????????????"
        visible={showBackTab}
        onCancel={handleBackCancel}
        footer={[
          <Button key="submit-back" type="primary" onClick={handleBack}>
            ??????
          </Button>,
          <Button key="submit-end" onClick={handleBackCancel}>
            ???????????????
          </Button>
        ]}
      >
        <div className="article-show-tab">
          <p>??????????????????????????????</p>
        </div>
      </Modal>
    </div>
  );
}
