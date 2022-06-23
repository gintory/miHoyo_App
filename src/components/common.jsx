//瀑布流数据分页
export function divideLine(showPicSource, clientWidth) {
  //计算每列列宽
  let lineWidth = clientWidth >= 992 ? (clientWidth - 440) / 4 - 25 : (clientWidth - 30) / 2 - 20;
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
    //列高包括图片放入瀑布流后的相对高度和图片之间的间距84px
    lineIndex = getMin(heightList);
    heightList[lineIndex] = heightList[lineIndex] + (item.picHeight / item.picWidth) * lineWidth + 85;
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
  let lineNum = document.body.clientWidth <= 992 ? 2 : 4;
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
