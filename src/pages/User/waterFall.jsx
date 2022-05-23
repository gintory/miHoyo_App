import React, { useEffect, useState } from 'react'
import { Modal, notification, Button, Input } from 'antd';
import { request } from '../../network/request';
import './waterFall.css'

export default function WaterFall(props) {
    const waterList = [
        {
            userName: 'GanYu',
            articleTitle: 'title1',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/21/167454286/b48e60a69ff14c5a4535c7c316840d8a_1014544778077712035.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'ZhongLi',
            articleTitle: 'title2',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2021/02/01/247406968/369d289ded186bdbfb95631ed4cbb6d4_6772572522358064643.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Venti',
            articleTitle: 'title3',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/18/271309855/f68f56681e927c9776f408d48f49bbf5_8791149058859478541.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Tartaglia',
            articleTitle: 'title4',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/22/16795825/4e08fb677d723e3b63dfa8378a48086f_5542829355208501331.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Diluc',
            articleTitle: 'title5',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/22/300635411/5f33d611c54bc064c8ea8e92e7a267c3_6955074174160183792.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Kaeya',
            articleTitle: 'title6',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/18/158107848/057898dc416e1b371498d4bd2015ee24_7764162595285711616.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Klee',
            articleTitle: 'title7',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/22/198805194/b6029334fcd81a1ab645189bcddb8802_5112440670096658151.png?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Gin',
            articleTitle: 'title8',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/19/183820274/90ab33fcf47afdd4aa07a5bb75da577b_1499301561377316989.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'HuTao',
            articleTitle: 'title9',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/23/296103897/eb770c51f9ed23c2d00ef137935dd447_3142936337195528354.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'KeQing',
            articleTitle: 'title10',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/22/2393822/c27f46ef52b6bf9167d327efeae42216_7871988119240143897.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Xiao',
            articleTitle: 'title11',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/14/2393822/b9d1b6cab5d9fff3986f5877d09e6654_1777042535302572923.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Alberdo',
            articleTitle: 'title12',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/15/198805194/ca47c784bf5178437a95cfdfc50dba34_7949499556178229038.png?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'XiangLing',
            articleTitle: 'title13',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/15/198805194/09faaf2caefdf8624b42d0e14d74f2cc_4296624038231635000.png?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'XingQiu',
            articleTitle: 'title14',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/13/82642572/d3cd0b6882466cde7ecd84d837b94770_7393721077299389640.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Lisa',
            articleTitle: 'title15',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/13/18643246/ce77a64a2dbc3011132985cf697db710_928751131243973876.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Fatui',
            articleTitle: 'title16',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/21/9529818/fb6a2bc974f9058f244524b6472aec78_1566264936312614233.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Lumine',
            articleTitle: 'title17',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/12/72846469/992abfbc7abb0c0b53067ccb34a15c77_9109565356709152839.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Ike',
            articleTitle: 'title18',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/18/9031288/97d3fb3171b7a1bdc34d4ad72e6f1aad_3010883314193626147.png?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Vox',
            articleTitle: 'title19',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/23/19037206/28845d12b64028dd0b2c4e2d1f724a15_6054821677216786351.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
        {
            userName: 'Mysta',
            articleTitle: 'title20',
            picUrl:'https://upload-bbs.mihoyo.com/upload/2022/03/21/6026478/c4b69261620a405dda1aca15f000d02c_5834066109927266816.png?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg'
        },
    ]

    let pageSize = 20;
    let imgBoxHeight = 0;
    let heightList = [0, 0, 0, 0];
    let [dataSource, setDataSource] = useState([]);
    let [showDataSource, setShowDataSource] = useState([]);
    let [totalCount, setTotalCount] = useState(0);
    let [totalPages, setTotalPages] = useState(0);
    let [beforeCount, setBeforeCount] = useState(0);
    let [pageNum, setPageNum] = useState(1);
    let [showPicTab, setShowPicTab] = useState(false);
    let [showPicIndex, setShowPicIndex] = useState(0);
    let [showPicUrl, setShowPicUrl] = useState('');
    let [dom, setDom] = useState(document.getElementById('home_content_main'));

    useEffect(() => {
        dom = document.getElementById('home_content_main')
        if(dom!=null){
            dom.addEventListener('scroll', onScroll);
        }
        getDataSource();
    }, []);
    //以下为原有
    useEffect(() => {
        if(dataSource.length > 0){
            setShowPicUrl(dataSource[showPicIndex].picUrl);
        }
    }, [showPicIndex]);
    useEffect(() => {
        if(showDataSource[showPicIndex]!=undefined) setShowPicUrl(showDataSource[showPicIndex].picUrl)
    }, [showPicIndex]);
    useEffect(() => {
        sliceShowDataSource();
    }, [pageNum, dataSource.length]);
    useEffect(()=>{
        return ()=>{
            if(dom!=null) dom.removeEventListener('scroll', onScroll);
        }
    },[]);

    async function getDataSource(){
        let source = []
        const res = await request({
            url: "/api/getPicture",
            method: "get",
        });
        let data = res.data.data;
        // console.log(data);
        if(data.code == 200){   
            source = data.content;
        }
        setDataSource([...source]);
        setTotalCount(source.length);
    };

    function sliceShowDataSource(){
        const { showDataSource, beforeCount, totalCount } = getRenderData({
          pageNum: pageNum,
          pageSize: pageSize,
          dataSource: dataSource,
        });
        setShowDataSource(showDataSource);
        setBeforeCount(beforeCount);
        setTotalCount(totalCount);
    };

    const onScroll = () => {
        let maxPageNum = getMaxPageNum();
        // if(imgBoxHeight == 0) imgBoxHeight = document.getElementsByClassName('articleTemp')[0].offsetHeight
        if(imgBoxHeight == 0){
            let linedom = document.getElementsByClassName('WaterLine');
            let LineHeight = linedom[0].offsetHeight;
            imgBoxHeight = LineHeight/(pageSize/4+1);
        }
        // console.log('当前scrollTop', dom.scrollTop, imgBoxHeight)
        const scrollPageNum = getPageNum({
          scrollTop: dom.scrollTop,
          pageSize: pageSize,
          itemHeight: imgBoxHeight,
        });
        const currPageNum = Math.min(scrollPageNum, maxPageNum);
        // console.log(maxPageNum,scrollPageNum,currPageNum,pageNum);
        if (currPageNum === pageNum) return;
        // console.log('next page')
        setPageNum(currPageNum);
    };
    

    // 获取最大页数
    function getMaxPageNum(){
        return getPageNum({
            // scrollTop: Math.ceil(totalCount/4)*itemHeight - dom.clientHeight,
            scrollTop: dom.scrollHeight - dom.clientHeight,
            pageSize: pageSize,
            itemHeight: imgBoxHeight,
        });
    };

    // 计算分页
    function getPageNum({ scrollTop, pageSize, itemHeight }){
        const pageHeight = pageSize/4 * itemHeight;
        return Math.max(Math.ceil((dom.clientHeight + scrollTop) / pageHeight), 1);
    };

     // 数据切片
     function getRenderData({ pageNum, pageSize, dataSource }){
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = Math.min((pageNum + 0) * pageSize, dataSource.length);
        return {
            showDataSource: dataSource.slice(0, endIndex),
            beforeCount: 0,
            totalCount: dataSource.length,
        };
    };

    //瀑布流根据图片高度布局
    function returnpic(){
        let lineDomList = [[],[],[],[]];
        let lineIndex = 0;
        let img = new Image();
        showDataSource.map((item,index) =>{
            lineIndex = getMin(heightList);
            img.src = item.picUrl;
            heightList[lineIndex] = heightList[lineIndex] + item.picHeight/item.picWidth*253 + 84;
            lineDomList[lineIndex].push(item);
        })
        return (
            <div className="waterList">
                <div className="WaterLine">{generateImgDom(lineDomList[0])}</div>
                <div className="WaterLine">{generateImgDom(lineDomList[1])}</div>
                <div className="WaterLine">{generateImgDom(lineDomList[2])}</div>
                <div className="WaterLine">{generateImgDom(lineDomList[3])}</div>
            </div>
        )
    }

    function generateImgDom(list){
        return (
            list.map((item,index) =>
            <div className="WaterArticleTemp" key={item.picUrl + Math.random()}>
                <div className="WaterImgbox" onClick={handleClickImg.bind(null,item,index)}>
                    <img className="waterArticleImg" src={item.picUrl}></img>
                </div>
                <div className='articleTitle'>
                    <div className='articleTitle_content'>{item.articleTitle}</div>
                </div>
                <div className='userName'>
                    {item.userName}
                    <span className="topIcon" style={{ display:parseInt(item.articleType) == 2?'true':'none'}}>置顶中</span>
                </div>
            </div>
            )
        )
    }

    function getMin(arr){
        let newarr = [...arr];
        newarr.sort((a,b)=>a-b);
        return arr.indexOf(newarr[0]);
    }

    function handleClickImg(item,index){
        setShowPicTab(true);
        setShowPicIndex(dataSource.indexOf(item));
    }

    function handleChangePic(num){
        let newIndex = (showPicIndex + num + dataSource.length) % dataSource.length;
        setShowPicIndex(newIndex);
    }

    function handleCancel(){
        setShowPicTab(false);
    }

    return(
        <div className="waterFall">
            { returnpic() }
            <Modal 
                title="查看图片" 
                visible={showPicTab} 
                onCancel={handleCancel}
                footer={[
                    <Button onClick={handleCancel}>Close</Button>,
                    <Button onClick={handleChangePic.bind(null,-1)}>Last</Button>,
                    <Button onClick={handleChangePic.bind(null,1)}>Next</Button>
                ]}
            >
                <div className="showPicTab">
                    <img src={showPicUrl} alt="" />
                </div>
            </Modal>
        </div>
    )
}