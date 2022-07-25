const CONTENT_PADDING = 440;
const CONTENT_PADDING_MIDDLE = 50;
const CONTENT_PADDING_MOBILE = 30;
const LINE_PADDING = 24;
const LINE_PADDING_MOBILE = 18;
const LINE_NUM = 4;
const LINE_NUM_MOBILE = 2;
const DISTANCE_BETWEEN_PICTURES = 85;

//瀑布流数据分页
export function divideLine(showPicSource, clientWidth) {
  //计算每列列宽，需要减去显示区域的padding和每列的padding值
  let lineWidth;
  if (clientWidth >= 992) {
    if (clientWidth <= 1370) {
      lineWidth = (clientWidth - CONTENT_PADDING_MIDDLE) / LINE_NUM - LINE_PADDING;
    } else {
      lineWidth = (clientWidth - CONTENT_PADDING) / LINE_NUM - LINE_PADDING;
    }
  } else {
    lineWidth = (clientWidth - CONTENT_PADDING_MOBILE) / LINE_NUM_MOBILE - LINE_PADDING_MOBILE;
  }
  let lineDomList = [];
  let lineIndex = 0;
  let heightList = [];
  if (document.body.clientWidth >= 992) {
    heightList = [0, 0, 0, 0];
    lineDomList = [[], [], [], []];
  } else {
    lineDomList = [[], []];
    heightList = [0, 0];
  }
  showPicSource.forEach((item, index) => {
    //列高包括图片放入瀑布流后的相对高度和每两张图片之间的间距84px
    lineIndex = getMin(heightList);
    heightList[lineIndex] =
      heightList[lineIndex] + (item.picHeight / item.picWidth) * lineWidth + DISTANCE_BETWEEN_PICTURES;
    lineDomList[lineIndex].push(item);
  });
  return lineDomList;
}

function getMin(arr) {
  let newArr = [...arr];
  newArr.sort((a, b) => a - b);
  return arr.indexOf(newArr[0]);
}

//当前页数
export function getPageNum(contentDom, { scrollTop, pageSize, itemHeight }) {
  let lineNum = document.body.clientWidth <= 992 ? LINE_NUM_MOBILE : LINE_NUM;
  const pageHeight = (pageSize / lineNum) * itemHeight;
  return Math.max(Math.ceil((contentDom.clientHeight + scrollTop) / pageHeight), 1);
}

//最大页数
export function getMaxPageNum(contentDom, pageSize, imgBoxHeight) {
  return getPageNum(contentDom, {
    scrollTop: contentDom.scrollHeight - contentDom.clientHeight,
    pageSize: pageSize,
    itemHeight: imgBoxHeight
  });
}

//数据切片
export function getRenderData({ pageNum, pageSize, dataSource }) {
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = Math.min((pageNum + 0) * pageSize, dataSource.length);
  return {
    showDataSource: dataSource.slice(0, endIndex),
    beforeCount: 0,
    totalCount: dataSource.length
  };
}
