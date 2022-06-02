import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Popconfirm, Table, notification, Modal, Button } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, UpCircleFilled, EditFilled, DeleteFilled } from '@ant-design/icons'
import { request } from '../../network/request'
// import { DraggableBodyRow } from '../../components/dragTable'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'
import './pictureResume.css'
var _ = require('lodash')

export default function Index(props) {
  let [dataSource, setDataSource] = useState([])
  let [totalCount, setTotalCount] = useState(0)
  let [loading, setLoading] = useState(null)
  let [showPicTab, setShowPicTab] = useState(false)
  let [showPicUrl, setShowPicUrl] = useState('')
  let [showPicIndex, setShowPicIndex] = useState(0)
  let [showDetail, setShowDetail] = useState({
    articleId: '',
    articleTitle: '',
    userName: '',
    articleState: 0,
    articleType: ''
  })
  const [filterInfo, setFilterInfo] = useState({
    index: 1,
    pageSize: 20
  })
  useEffect(() => {
    getDataSource()
  }, [])
  useEffect(() => {
    if (dataSource[showPicIndex] !== undefined) setShowPicUrl(dataSource[showPicIndex].picUrl)
  }, [showPicIndex])
  const table = useMemo(() => {
    _.forEach(dataSource, (item) => {
      switch (parseInt(item.articleState)) {
        case 1:
          item.articleState = '审核中'
          break
        case 2:
          item.articleState = '审核通过'
          break
        case 3:
          item.articleState = '审核未通过'
          break
        default:
          item.articleState = '错误'
      }
    })
    return dataSource
  }, [dataSource])
  const moveRow = useCallback((props) => {}, [table])
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
      width: '90px',
      align: 'center'
    },
    {
      title: '目前状态',
      key: 'articleState',
      width: '100px',
      align: 'center',
      render: (item, record) => {
        switch (item.articleState) {
          case '审核通过':
            return <span style={{ color: '#5cb85c' }}>{item.articleState}</span>
          case '审核中':
            return <span style={{ color: '#f0a339' }}>{item.articleState}</span>
          case '审核未通过':
            return <span style={{ color: '#cc0000' }}>{item.articleState}</span>
          default:
            return <span>{item.articleState}</span>
        }
      }
    },
    {
      title: '图片',
      key: 'picUrl',
      width: '140px',
      align: 'center',
      render: (item, record) => {
        return (
          <div className="resume-picture">
            <div className="article-temp-imgBox" onClick={handleClickImg.bind(null, item)}>
              <div
                className="article-temp-img"
                style={{ backgroundImage: 'url(' + item.picUrl + ')', borderRadius: '5%' }}
              ></div>
            </div>
          </div>
        )
      }
    },
    {
      title: '置顶状态',
      key: 'articleType',
      width: '100px',
      align: 'center',
      render: (item, record) => {
        switch (parseInt(item.articleType)) {
          case 1:
            return <span style={{ color: '#a19f9f' }}>未置顶</span>
          case 2:
            return <span style={{ color: '#cc0000' }}>置顶中</span>
          default:
            return <span style={{ color: '#cc0000' }}>未知</span>
        }
      }
    },
    {
      title: '操作',
      key: 'userName',
      align: 'center',
      width: '400px',
      fixed: 'right',
      ellipsis: true,
      render: (item, record) => (
        <div>
          <Button
            size="small"
            onClick={handleStatusChange.bind(null, '审核通过', item)}
            style={{ borderColor: '#5cb85c', backgroundColor: '#5cb85c', color: '#FFFFFF', margin: '0 5px 0 5px' }}
          >
            审核通过
          </Button>
          <Button
            size="small"
            onClick={handleStatusChange.bind(null, '审核未通过', item)}
            style={{ borderColor: '#f0a339', backgroundColor: '#f0a339', color: '#FFFFFF', margin: '0 5px 0 5px' }}
          >
            审核未通过
          </Button>
          <Button
            size="small"
            onClick={handleTopChange.bind(null, item)}
            style={{ borderColor: '#6fc7e2', backgroundColor: '#6fc7e2', color: '#FFFFFF', margin: '0 5px 0 5px' }}
          >
            {item.articleType === '1' ? '置顶' : '取消置顶'}
          </Button>
          <Popconfirm
            placement="bottomRight"
            title="确认删除吗？"
            onConfirm={handleDeleteItem.bind(null, item)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="danger"
              size="small"
              style={{ borderColor: '#cc0000', backgroundColor: '#cc0000', color: '#FFFFFF', margin: '0 5px 0 5px' }}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]
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
            onClick={handleStatusChange.bind(null, '审核通过', item)}
            style={{ color: '#5cb85c', margin: '0 5px 0 5px', fontSize: '20px' }}
          />
          <CloseCircleFilled
            onClick={handleStatusChange.bind(null, '审核未通过', item)}
            style={{ color: '#f0a339', margin: '0 5px 0 5px', fontSize: '20px' }}
          />
          {item.articleType === '1' ? (
            <UpCircleFilled
              onClick={handleTopChange.bind(null, item)}
              style={{ color: '#6fc7e2', margin: '0 5px 0 5px', fontSize: '20px' }}
            />
          ) : (
            <UpCircleFilled
              onClick={handleTopChange.bind(null, item)}
              style={{ color: '#ccc', margin: '0 5px 0 5px', fontSize: '20px' }}
            />
          )}
          <EditFilled
            onClick={handleClickImg.bind(null, item)}
            style={{ color: '#f0a339', margin: '0 5px 0 5px', fontSize: '20px' }}
          />
          <Popconfirm
            placement="bottomRight"
            title="确认删除吗？"
            onConfirm={handleDeleteItem.bind(null, item)}
            okText="确定"
            cancelText="取消"
          >
            <DeleteFilled style={{ color: '#cc0000', margin: '0 5px 0 5px', fontSize: '20px' }} />
          </Popconfirm>
        </div>
      )
    }
  ]

  async function getDataSource() {
    setLoading(true)
    let source = []
    const res = await request({
      url: '/api/getAllPicture',
      method: 'get'
    })
    let data = res.data.data
    if (data.code === 200) {
      source = data.content
      setLoading(false)
    }
    setDataSource([...source])
    setTotalCount(source.length)
  }
  async function handleStatusChange(type, item) {
    let data = Object.assign({}, item)
    switch (type) {
      case '审核通过':
        data.articleState = 2
        break
      case '审核未通过':
        data.articleState = 3
        break
      default:
    }
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '审核成功!' })
      getDataSource()
    })
  }
  async function handleStatusChangeByModal(type) {
    let data = dataSource[showPicIndex]
    data.articleState = type
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '审核成功!' })
      getDataSource()
    })
  }
  async function handleTopChange(item) {
    let data = Object.assign({}, item)
    switch (parseInt(data.articleType)) {
      case 1:
        data.articleType = 2
        break
      case 2:
        data.articleType = 1
        break
      default:
    }
    switch (data.articleState) {
      case '审核通过':
        data.articleState = 2
        break
      case '审核未通过':
        data.articleState = 3
        break
      default:
    }
    request({
      url: '/api/updateArticle',
      method: 'post',
      data: data
    }).then((res) => {
      notification.success({ description: '通知', message: '修改置顶状态成功!' })
      getDataSource()
    })
  }
  async function handleDeleteItem(data) {
    request({
      url: '/api/deleteArticle',
      method: 'post',
      data: {
        articleId: data.articleId
      }
    }).then((res) => {
      notification.success({ description: '通知', message: '删除成功!' })
      getDataSource()
    })
  }
  function handleClickImg(item) {
    setShowPicTab(true)
    setShowPicUrl(item.picUrl)
    setShowPicIndex(_.findIndex(dataSource, item))
    setShowDetail(item)
  }
  function handleCancel() {
    setShowPicTab(false)
  }
  function handleChangePic(num) {
    let newIndex = (showPicIndex + num + dataSource.length) % dataSource.length
    setShowPicIndex(newIndex)
    setShowDetail(dataSource[newIndex])
  }
  function handlePageChange(event, pageSize) {
    const index = event
    setFilterInfo({ ...filterInfo, pageSize, currIndex: index, index: index })
  }

  return (
    <div className="pictureResume">
      <div className="resume-content">
        <div className="table" style={{ overflowX: 'auto' }}>
          <Table
            rowKey="articleId"
            columns={columns}
            dataSource={table}
            loading={loading}
            className="picture-table"
            // scroll={{ x: '1450px' }}
            onRow={(record, index) => ({
              record, // 当前数据
              table, // 完整数据
              index, // 当前数据索引
              moveRow // 移动后修改数据的方法
            })}
            pagination={{
              total: totalCount,
              showTotal: (totalCount) => '共 ' + totalCount + ' 条记录',
              current: filterInfo.index,
              pageSize: filterInfo.pageSize,
              pageSizeOptions: [10, 20, 30],
              onChange: handlePageChange,
              showSizeChanger: true
            }}
          />
          <Table
            rowKey="articleId"
            columns={mobileColumns}
            dataSource={table}
            loading={loading}
            className="picture-mobile-table"
            pagination={{
              total: totalCount,
              showTotal: (totalCount) => '共 ' + totalCount + ' 条记录',
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
        title={document.body.clientWidth <= 992 ? '图片详情' : '查看图片'}
        visible={showPicTab}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleChangePic.bind(null, -1)}>Last</Button>,
          <Button
            onClick={handleStatusChangeByModal.bind(null, 2)}
            style={{ borderColor: '#5cb85c', backgroundColor: '#5cb85c', color: '#FFFFFF' }}
          >
            审核通过
          </Button>,
          <Button
            onClick={handleStatusChangeByModal.bind(null, 3)}
            style={{ borderColor: '#f0a339', backgroundColor: '#f0a339', color: '#FFFFFF' }}
          >
            审核未通过
          </Button>,
          <Button onClick={handleChangePic.bind(null, 1)}>Next</Button>
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
            <div className="article-detail-value">{showDetail.articleType === '2' ? '置顶中' : '未置顶'}</div>
          </div>
        </div>
        <div className="article-showPicTab">
          <img src={showPicUrl} alt="" />
        </div>
      </Modal>
    </div>
  )
}
