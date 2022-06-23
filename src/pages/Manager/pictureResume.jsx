import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Popconfirm, Table, notification, Modal, Button } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, UpCircleFilled, EditFilled, DeleteFilled } from '@ant-design/icons';
import { request } from '../../network/request';
import { DraggableBodyRow } from '../../components/dragTable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './pictureResume.css';

export default function Index(props) {
  let LoadingImg = new Image();
  LoadingImg.src = '../assets/loading.gif';
  const [dataSource, setDataSource] = useState([]);
  const [showPicSource, setShowPicSource] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(null);
  const [showPicTab, setShowPicTab] = useState(false);
  const [showPicUrl, setShowPicUrl] = useState('');
  const [showPicIndex, setShowPicIndex] = useState(0);
  const [showDetail, setShowDetail] = useState({
    articleId: '',
    articleTitle: '',
    userName: '',
    articleState: 0,
    articleType: ''
  });
  const [filterInfo, setFilterInfo] = useState({
    index: 1,
    currIndex: 1,
    pageSize: 20
  });
  const columns = [
    {
      title: '文章编号',
      dataIndex: 'articleId',
      key: 'articleId',
      width: '90px',
      align: 'center'
    },
    {
      title: '文章标题',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      width: '140px',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '作者',
      dataIndex: 'userName',
      key: 'userName',
      width: '80px',
      align: 'center',
      ellipsis: true
    },
    {
      title: '目前状态',
      key: 'articleState',
      width: '100px',
      align: 'center',
      render: (item, record) => {
        if (item.articleState === '审核通过') {
          return <span className="text-success">{item.articleState}</span>;
        } else if (item.articleState === '审核中') {
          return <span className="text-wait">{item.articleState}</span>;
        } else if (item.articleState === '审核未通过') {
          return <span className="text-delete">{item.articleState}</span>;
        } else {
          return <span>{item.articleState}</span>;
        }
      }
    },
    {
      title: '图片',
      key: 'picUrl',
      width: '120px',
      align: 'center',
      render: (item, record, index) => {
        return (
          <div className="resume-picture">
            <div className="article-temp-box" onClick={() => handleClickImg(item)}>
              <div
                className="article-temp-img"
                style={{
                  backgroundImage: `url(${showPicSource[(filterInfo.currIndex - 1) * filterInfo.pageSize + index]})`,
                  borderRadius: '5%'
                }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      title: '置顶状态',
      key: 'articleType',
      width: '90px',
      align: 'center',
      render: (item, record) => {
        if (Number(item.articleType) === 1) {
          return <span className="text-none">未置顶</span>;
        } else if (Number(item.articleType) === 2) {
          return <span className="text-delete">置顶中</span>;
        } else {
          return <span>未知</span>;
        }
      }
    },
    {
      title: '操作',
      key: 'userName',
      align: 'center',
      width: '350px',
      render: (item, record) => (
        <div>
          <Button
            size="small"
            className="resume-button button-success"
            onClick={() => handleStatusChange('审核通过', item)}
          >
            审核通过
          </Button>
          <Button
            size="small"
            className="resume-button button-wait"
            onClick={() => handleStatusChange('审核未通过', item)}
          >
            审核未通过
          </Button>
          <Button size="small" className="resume-button button-top" onClick={() => handleTopChange(item)}>
            {item.articleType === 1 ? '置顶' : '取消置顶'}
          </Button>
          <Popconfirm
            placement="bottomRight"
            title="确认删除吗？"
            onConfirm={() => handleDeleteItem(item)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="danger" size="small" className="resume-button button-delete">
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];
  const mobileColumns = [
    {
      title: '文章标题',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      width: '100px',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '作者',
      dataIndex: 'userName',
      key: 'userName',
      width: '80px',
      align: 'center'
    },
    {
      title: '操作',
      key: 'userName',
      align: 'center',
      width: '50%',
      ellipsis: true,
      render: (item, record) => (
        <div>
          <CheckCircleFilled
            className="resume-button-mobile text-success"
            onClick={() => handleStatusChange('审核通过', item)}
          />
          <CloseCircleFilled
            className="resume-button-mobile text-wait"
            onClick={() => handleStatusChange('审核未通过', item)}
          />
          <UpCircleFilled
            onClick={() => handleTopChange(item)}
            className={
              Number(item.articleType) === 1 ? 'resume-button-mobile text-top' : 'resume-button-mobile text-none'
            }
          />
          <EditFilled className="resume-button-mobile text-wait" onClick={() => handleClickImg(item)} />
          <Popconfirm
            placement="bottomRight"
            title="确认删除吗？"
            onConfirm={() => handleDeleteItem(item)}
            okText="确定"
            cancelText="取消"
          >
            <DeleteFilled className="resume-button-mobile text-delete" />
          </Popconfirm>
        </div>
      )
    }
  ];
  const components = {
    body: {
      row: DraggableBodyRow
    }
  };
  const handleState = {
    1: () => {
      return '审核中';
    },
    2: () => {
      return '审核通过';
    },
    3: () => {
      return '审核未通过';
    }
  };
  useEffect(() => {
    getDataSource();
  }, []);
  const table = useMemo(() => {
    let arr = new Array(dataSource.length).fill('../assets/loading.gif');
    setShowPicSource([...arr]);
    dataSource.forEach((item, index) => {
      let handle = handleState[Number(item.articleState)];
      if (handle) {
        item.articleState = handle();
      }
      let img = new Image();
      img.src = item.picUrl;
      img.onload = function () {
        arr[index] = item.picUrl;
        setShowPicSource([...arr]);
      };
    });
    setDataSource(dataSource);
    return dataSource;
  }, [dataSource]);
  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = table[(filterInfo.currIndex - 1) * filterInfo.pageSize + dragIndex];
      setDataSource(
        update(table, {
          $splice: [
            [(filterInfo.currIndex - 1) * filterInfo.pageSize + dragIndex, 1],
            [(filterInfo.currIndex - 1) * filterInfo.pageSize + hoverIndex, 0, dragRow]
          ]
        })
      );
    },
    [table]
  );

  function getDataSource() {
    setLoading(true);
    request({
      url: '/api/getAllPicture',
      method: 'get'
    }).then((val) => {
      if (val.data.data.code === 200) {
        setLoading(false);
        setDataSource(val.data.data.content);
        setTotalCount(val.data.data.content.length);
      }
    });
  }
  function handleStatusChange(type, item) {
    let data = Object.assign({}, item);
    if (type === '审核通过') {
      data.articleState = 2;
    } else if (type === '审核未通过') {
      data.articleState = 3;
    }
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '审核成功!' });
      getDataSource();
    });
  }
  function handleStatusChangeByModal(type) {
    let data = dataSource[showPicIndex];
    data.articleState = type;
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '审核成功!' });
      getDataSource();
    });
  }
  function handleTopChange(item) {
    let data = Object.assign({}, item);
    if (Number(data.articleType) === 1) {
      data.articleType = 2;
    } else if (Number(data.articleType) === 2) {
      data.articleType = 1;
    }
    if (data.articleState === '审核通过') {
      data.articleState = 2;
    } else if (data.articleState === '审核未通过') {
      data.articleState = 3;
    }
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '修改置顶状态成功!' });
      getDataSource();
    });
  }
  function handleDeleteItem(data) {
    request({
      url: '/api/deleteArticle',
      method: 'post',
      data: {
        articleId: data.articleId
      }
    }).then((res) => {
      notification.success({ description: '通知', message: '删除成功!' });
      getDataSource();
    });
  }
  function handleClickImg(item) {
    setShowPicTab(true);
    setShowPicUrl(item.picUrl);
    setShowPicIndex(dataSource.indexOf(item));
    setShowPicUrl(dataSource[dataSource.indexOf(item)].picUrl);
    setShowDetail(item);
  }
  function handleCancel() {
    setShowPicTab(false);
  }
  function handleChangePic(num) {
    const newIndex = (showPicIndex + num + dataSource.length) % dataSource.length;
    setShowPicIndex(newIndex);
    setShowPicUrl(dataSource[newIndex].picUrl);
    setShowDetail(dataSource[newIndex]);
  }
  function handlePageChange(event, pageSize) {
    const index = event;
    setFilterInfo({ ...filterInfo, pageSize, currIndex: index, index: index });
  }

  return (
    <div className="pictureResume">
      <div className="resume-content">
        <div className="table">
          <DndProvider backend={HTML5Backend}>
            <Table
              rowKey="articleId"
              columns={columns}
              dataSource={table}
              loading={loading}
              className="picture-table"
              components={components}
              onRow={(record, index) => ({
                record,
                table,
                index,
                moveRow
              })}
              pagination={{
                total: totalCount,
                showTotal: (totalCount) => `共 ${totalCount} 条记录`,
                current: filterInfo.index,
                pageSize: filterInfo.pageSize,
                pageSizeOptions: [10, 20, 30],
                onChange: handlePageChange,
                showSizeChanger: true
              }}
              sticky="top"
            />
          </DndProvider>
          <Table
            rowKey="articleId"
            columns={mobileColumns}
            dataSource={table}
            loading={loading}
            className="picture-mobile-table"
            pagination={{
              total: totalCount,
              showTotal: (totalCount) => `共 ${totalCount} 条记录`,
              current: filterInfo.index,
              pageSize: filterInfo.pageSize,
              pageSizeOptions: [10, 20, 30],
              onChange: handlePageChange,
              showSizeChanger: true
            }}
          />
        </div>
      </div>
      <Modal
        title="图片详情"
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Button key="click-last-picture" onClick={() => handleChangePic(-1)}>
            上一张
          </Button>,
          <Button
            key="picture-success"
            className="resume-button button-success"
            onClick={() => handleStatusChangeByModal(2)}
          >
            审核通过
          </Button>,
          <Button key="picture-fail" className="resume-button button-wait" onClick={() => handleStatusChangeByModal(3)}>
            审核未通过
          </Button>,
          <Button key="click-next-picture" onClick={() => handleChangePic(1)}>
            下一张
          </Button>
        ]}
      >
        <div className="article-detail">
          <div className="article-detail-item">
            <div className="article-detail-key">文章编号：</div>
            <div className="article-detail-value">{showDetail.articleId}</div>
          </div>
          <div className="article-detail-item">
            <div className="article-detail-key">文章标题：</div>
            <div className="article-detail-value">{showDetail.articleTitle}</div>
          </div>
          <div className="article-detail-item">
            <div className="article-detail-key">作者：</div>
            <div className="article-detail-value">{showDetail.userName}</div>
          </div>
          <div className="article-detail-item">
            <div className="article-detail-key">目前状态：</div>
            <div className="article-detail-value">{showDetail.articleState}</div>
          </div>
          <div className="article-detail-item">
            <div className="article-detail-key">置顶状态：</div>
            <div className="article-detail-value">{Number(showDetail.articleType) === 2 ? '置顶中' : '未置顶'}</div>
          </div>
        </div>
        <div className="article-show-tab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
    </div>
  );
}
