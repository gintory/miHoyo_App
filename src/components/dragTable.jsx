import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = "DraggableBodyRow";
// 操作类型
const optionsTyps = {
  didDrop: "didDrop", // 拖拽出区域
  hover: "hover",
  drop: "drop" // 放置
};
// 数据类型
const dataType = {
  group: "group",
  child: "child"
};

export const DraggableBodyRow = (props) => {
  let {
    record, // 当前行数据
    data,  // 完整数据
    index, //当前行数据索引
    className,
    style,
    moveRow, // 移动后修改数据的方法
    findRow,
    ...restProps
  } = props;

  if (!record) return null;

  let itemObj = {
    id: record.id,
    parentId: record.parentId,
    index,
    isGroup: record.type === dataType.group,
  };

  let isDrag = true; // 是否可以拖拽，这里所有行均可拖拽，所以没有做判断限制

  const ref = useRef();

  // useDrop 是一个hook方法，提供了一种方法让你的组件可以作为放置目标连接到DnD系统。
  const [{ handlerId, isOver, dropClassName }, drop] = useDrop({
    accept: ItemTypes, // 只对useDrag的type的值为ItemTypes时才做出反应
    collect: (monitor) => {
      const {
        id: dragId,
        parentId: dragParentId,
        index: dragPreIndex,
        isGroup
      } = monitor.getItem() || {}; // 这里获取的数据内容同 itemObj

      // 如果拖拽的id和当前行相等则不处理
      if (dragId === record.id) {
        return {};
      }

      // 是否可以拖拽替换
      let isOver = monitor.isOver();
      if (isGroup) {
        // 要覆盖的数据是分组，或者是最外层的子项可以替换，其他情况不可以
        let recordIsGroup = record.type === dataType.group;
        if (!recordIsGroup) {
          isOver = false;
        }
      } else {
        // 要覆盖的数据是子项，但不在同分组不可以替换
        if (dragParentId !== record.parentId) {
          isOver = false;
        }
      }

      return {
        isOver, // 是否覆盖
        dropClassName: "drop-over-downward", // 拖拽hover时样式
        handlerId: monitor.getHandlerId()
      };
    },
    drop: (item) => { // 
      let opt = {
        dragId: item.id, // 拖拽id
        dropId: record.id, // 要放置位置行的id
        dropType: record.type,
        dropParentId: record.parentId,
        operateType: optionsTyps.drop
      };
      moveRow(opt); // 调用传入的方法完成数据修改
    }
  });

  // useDrag 是hook方法，提供了一种方法让你的组件可以作为拖动源连接到DnD系统。
  // isDragging是通过 collect收集并解构出来的属性
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes, // 可拖拽的类型
    item: itemObj, // 拖动源
    collect: (monitor) => ({ // 收集器
      isDragging: monitor.isDragging() // css样式需要
    }),
  });

  // ref 这样处理可以使得这个组件既可以被拖动也可以接受拖动
  drop(drag(ref));

  // 拖拽行的位置显示透明
  const opacity = isDragging ? 0 : 1;

  return (
    <tr
      ref={ref}
      className={`${className}
      ${isOver ? dropClassName : ""} 
      ${isDrag ? "can-drag" : ""}`}
      style={isDrag ? { cursor: "move", opacity, ...style } : { ...style }}
      data-handler-id={handlerId}
      {...restProps}
    />
  );
};

