/*
write by       : wuweiwei (邬畏畏)
blogs          : www.blogs.com/wsoft
WUI            : www.flybirdsoft.com/WUI

function:
转换数据格式
*/

var Grid = {
	exchangeHeader : function(headerData){
		/*headerData is array*/
		var i , j , n = 0;	
		var columns = [];
		var merge = [] , obj;
		var fixedCol = 0;
		for(i=0;i<headerData.length;i++)
		{
			obj = {};
			obj.start = n;
			obj.end   = n + headerData[i].data.length -1;
			obj.caption = headerData[i].groupName;
			merge.push(obj);

			for(j=0;j<headerData[i].data.length;j++)
			{
				headerData[i].data[j].field = headerData[i].data[j].name;
				headerData[i].data[j].caption = headerData[i].data[j].display;				
				columns.push(headerData[i].data[j]);
				if(headerData[i].data[j].frozen=="true")
				{
					fixedCol++;
				}
				n++;
			}
		}
		return {
			columns : columns,
			merge   : merge,
			fixedCol : fixedCol
		}
	} , /*end function*/
	
	createGrid : function(p,options){
		var _options = {
			fixedCol:0,
			columns : options.columns ,
			rows:data.tableData,
			/*mergeHeader : options.merge , */
			columnWidth : options.columnWidth||100 ,
			isSort : options.isSort || false ,
			height : options.height || "auto",
			isMatrix : options.isMatrix || false
		}
		_options[options.mergeType||"mergeHeader"] = options.merge;
		alert(JSON.stringify(options.merge));
		return new fixedGrid(p,_options);
	}
};