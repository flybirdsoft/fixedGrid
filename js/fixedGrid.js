
/*
component Name : fixedGrid
write by       : wuweiwei (邬畏畏)
blogs          : www.blogs.com/wsoft
WUI            : www.flybirdsoft.com/WUI

function:
	1.多表头
	2.多行合并
	3.固定列
	4.实现列排序功能
*/

var fixedGrid = function(p,options){
	this.event = {};
	this.eventHandler = [];
	this.processHandler = function(){};
	this.pageObject = {};
	this.parentName = p;
	this.$parent = $(p);
	this.$parent.removeClass("wFixedGrid");
	this.$parent.addClass("wFixedGrid");
	this.options = options;
	this.options.id = options.id || "fixedGrid";
	this.options.height = options.height || "auto";
	this.options.width = options.width || "auto";
	this.columnStyle = "";                            
	this.columnStyle = "width:"+this.options.columnWidth+"px;min-width:"+this.options.columnWidth+"px;";
	this.sortHTML = '<div class="fixedGrid-sort" index={n} style="float:right;margin-right:5px;width:0;height:0;border-top:5px solid #ccc;border-left:5px solid transparent;border-right:5px solid transparent;"></div>';

	this.topDivView1HTML = '<div class="fixedGrid-view1" style="float:left;">{content}</div>';
	this.topDivView2HTML = '<div class="fixedGrid-view2" style="overflow:hidden;">{content}</div>';
	this.viewHeaderHTML = '<div class="fixedGrid-header">{content}</div>'; 
	this.viewBodyHTML = '<div class="fixedGrid-body">{content}</div>'; 
	this.tableHTML = '<table class="fixedGrid-table" cellspacing="0" cellpadding="0" border="0" style="{style}">'+
						'{content}'+
	                 '</table>';


	var fixedGrid = $(this.parentName + " .fixedGrid")[0];
	if(fixedGrid!=undefined)
	{
		fixedGrid.parentNode.removeChild(fixedGrid);
	}
	var fixedGridPage = $(this.parentName + " .fixedGridPage")[0];
	if(fixedGridPage!=undefined)
	{
		fixedGridPage.parentNode.removeChild(fixedGridPage);
	}

	this.topDivHTML = document.createElement("div");  
	this.topDivHTML.id = this.options.id;

	this.topDivHTML.className = "fixedGrid";
	if(this.options.height!="auto")
	{
		this.topDivHTML.style.height = this.options.height + "px";
	}
	if(this.options.width!="auto")
	{

		this.topDivHTML.style.width = this.options.width + "px";
	}

	this.$parent[0].appendChild(this.topDivHTML);
	this.getMergeHeader();
	this.getMergeRow();
	this.exchangeData(this.options.rows);
	if(this.options.isMatrix!=undefined && this.options.isMatrix)
	{
		this.getMatrix();
	}
	this.initData();
	/* create page */
	this.createPage();
	/*create page end*/
	if(this.options.onLoad != undefined)
	{
		this.options.onLoad.call(this);
	}
	this.processHandler.call(this);
}


fixedGrid.prototype.getMergeHeader = function(){
	var ar , mergeAr=[] , i , j , object,cobj; 
	this.mergeHeaderString = "";
	if(this.options.mergeHeader !=undefined)
	{
		ar = this.options.mergeHeader;
		for(i=0;i<ar.length;i++)
		{
			object = new Object();
			object.start = parseInt(ar[i].start);
			object.end = parseInt(ar[i].end);
			object.length = object.end - object.start + 1;
			object.caption = ar[i].caption;
			mergeAr.push(object);
			if(mergeAr.length>1)
			{
				if(mergeAr[mergeAr.length-1].start < mergeAr[mergeAr.length-2].start)
				{
					cobj = mergeAr[mergeAr.length-1];
					mergeAr[mergeAr.length-1] = mergeAr[mergeAr.length-2];
					mergeAr[mergeAr.length-2] = cobj;
				}
			}

			for(j=ar[i].start;j<=ar[i].end;j++)
			{
				this.mergeHeaderString += j + ",";
			}
		}
		this.mergeHeader = mergeAr;   
	}
}


fixedGrid.prototype.getMergeRow = function(){
	var ar , mergeAr=[] , i , j , object,cobj;    
	this.mergeRowString = "";
	if(this.options.mergeRow !=undefined)
	{
		ar = this.options.mergeRow;
		for(i=0;i<ar.length;i++)
		{
			object = new Object();
			object.start = parseInt(ar[i].start);
			object.end = parseInt(ar[i].end);
			object.length = object.end - object.start + 1;
			object.caption = ar[i].caption;
			mergeAr.push(object);
			if(mergeAr.length>1)
			{
				if(mergeAr[mergeAr.length-1].start < mergeAr[mergeAr.length-2].start)
				{
					cobj = mergeAr[mergeAr.length-1];
					mergeAr[mergeAr.length-1] = mergeAr[mergeAr.length-2];
					mergeAr[mergeAr.length-2] = cobj;
				}
			}

			for(j=ar[i].start;j<=ar[i].end;j++)
			{
				this.mergeRowString += j + ",";
			}
		}
		this.mergeRow = mergeAr;   /*存储合并表头的JSON*/
		return;
		if(this.options.isMatrix!=undefined && this.options.isMatrix)
		{
			this.mergeRow.shift();
			for(i=0;i<this.mergeRow.length;i++)
			{
				this.mergeRow[i].start--;
				this.mergeRow[i].end--;
			}
		}
	}
}

fixedGrid.prototype.exchangeData = function(rows){
	var v , i , j , len , item , forV = 0 , forV2 = 0;
	var newRows = [] , object = {};
	//var rows = this.options.rows;/*get data list*/
	var columns = this.options.columns;
	var colLen = this.options.columns.length;
	if(rows!=undefined)
	{
		this.options.rows = rows;
	}
	if(this.options.rows==undefined)
	{
		return;
	}
	len = this.options.rows.length;

	for(i=0;i<len;i++)
	{
		object = {};
		for(j=0;j<colLen;j++)
		{
			forV2 = forV =0;
			for(v in rows[i])
			{
				if(v == columns[j].field)
				{
					object[columns[j].field] = rows[i][v];
				}
				else
				{
					forV2++;
				}
				forV++;
			}
			if(forV==forV2)
			{
				object[columns[j].field] = "&nbsp;";
			}
		}
		newRows.push(object);
	}
	
	this.options.newRows = newRows; 
}

fixedGrid.prototype.initData = function(json) {


	var i;
	var columns = this.options.columns;
	var rows = this.options.newRows;
	var len ,baseN = 0;
	var resultObject = {};
	if(rows!=undefined) 
	{
		if(this.options.pageSize!=undefined)
		{
			len = this.options.pageSize<rows.length ? this.options.pageSize : rows.length;
		}
		else
		{
			len = rows.length;
		}

		if(json!=undefined)
		{
			if(!json.isAjax)
			{
				baseN = (json.pageIndex-1) * len;
			}
		}
	}
	else 
	{
		len = 0;  
	}
	var trTmpl = '<tr class="fixedGrid-row fixedGrid-row-{n}" index="{n}">{content}</tr>';
	var tdTmpl = '<td class="fixedGrid-col fixedGrid-col-{n}" style="{style}" index="{n}">{content}</td>';
	var td , tr , tds = "" , trs = "" , i , colN=0; 
	var td2, tr2, tds2= "" , trs2= "";
	var mTdTmplR = '<td class="fixedGrid-col fixedGrid-rowspan fixedGrid-col-{n}" rowspan="{rown}" style="{style}">{content}</td>';  /*多行头*/
	var mTdTmpl  = '<td class="fixedGrid-col fixedGrid-col-{n}" colspan="{coln}" style="{style}">{content}</td>';  /*多表头*/
	var mTd , mTr , mTds ="" , mTrs = "";  
	var mTd2,mTr2 , mTds2="" , mTrs2 ="";
	var rowIndex = 0 , colIndex = 0;
	var table = this.tableHTML;
	var tableHeader1 = this.tableHTML;
	var tableBody1 = this.tableHTML;
	var tableHeader2 = this.tableHTML;
	var tableBody2 = this.tableHTML;

	var topDivHTML = this.topDivHTML;
	var topDivView1HTML = this.topDivView1HTML;
	var topDivView2HTML = this.topDivView2HTML;
	var viewHeaderHTML1 = this.viewHeaderHTML;
	var viewBodyHTML1 = this.viewBodyHTML;
	var viewHeaderHTML2 = this.viewHeaderHTML;
	var viewBodyHTML2 = this.viewBodyHTML;

	var fieldValue = "";
	var field = "";
	var mergeIndex = 0;
	var maxEnd = 0;     
	var columnStyle="";

	if(this.options.fixedCol==undefined||this.options.fixedCol==0)
	{
		tableBody1 ="";
		tableHeader1 = "";
		mergeIndex = 0;
		for(i=baseN ; i<len+baseN ; i++)
		{
			if(this.options.mergeRow != undefined) 
			{
				if(mergeIndex<this.mergeRow.length)
				{
					if(this.mergeRow[mergeIndex].start==i)
					{
						mTd = mTdTmplR;
						mTd = mTd.replace("{n}","rowspan-"+i);
						mTd = mTd.replace("{rown}",this.mergeRow[mergeIndex].length);
						mTd = mTd.replace("{content}",this.mergeRow[mergeIndex].caption);
						maxEnd = this.mergeRow[mergeIndex].end;
						mergeIndex++;
					}
					else if(this.mergeRowString.indexOf(i.toString())==-1)
					{
						td = tdTmpl;
						td = td.replace("{n}","empty-" + i + " fixedGrid-col-empty fixedGrid-rowspan");
						mTd = td.replace("{content}","&nbsp;");
					}
					else
					{
						mTd ="";
					}
				}
				else if(i>maxEnd)
				{
					mTd = tdTmpl;
					mTd = mTd.replace("{n}","empty-" + i + " fixedGrid-col-empty fixedGrid-rowspan");
					mTd = mTd.replace("{content}","&nbsp;");
				}
			}/*end if mergeRow*/

			tr = trTmpl;
			tr = tr.replace(/\{n\}/g,i);
			colIndex = 0;

			for(v in rows[i])
			{
				columnStyle = this.columnStyle;
				fieldValue = rows[i][v];

				resultObject.rows = rows;
				resultObject.rowIndex = i;
				resultObject.text = fieldValue;
				if(columns[colN]!=undefined && columns[colN].formatter!=undefined)
				{
					resultObject.column = columns[colN];
					fieldValue = columns[colN].formatter.call(this,resultObject);
					if(fieldValue == undefined)
					{
						fieldValue = resultObject.text; /*如果fieldValue没有返回值时，恢复原值*/
					}

				}
				td = tdTmpl;
				td = td.replace(/\{n\}/g,colIndex);
				if(columns[colN]!=undefined && columns[colN].width!=undefined)
				{
					columnStyle = columnStyle.replace(this.options.columnWidth , columns[colN].width);
					columnStyle = columnStyle.replace(this.options.columnWidth , columns[colN].width);
				}
				td = td.replace("{style}",columnStyle);
				tds = tds + td.replace("{content}",fieldValue);
				colN++;
				colIndex++;
			}
			if(mTd==undefined)
			{
				mTd="";
			}
			trs = trs + tr.replace("{content}",mTd + tds);
			mTd="";
			tds = "";
			colN = 0;
		}/*end for 数据集*/


		tableBody2 = tableBody2.replace("{content}",trs);

		
		mergeIndex = 0;
		mTds = "";
		for(i=0;i<columns.length;i++)
		{
			columnStyle = this.columnStyle;
			field = columns[i].caption || columns[i].field;
			if(columns[i].headerFormatter!=undefined)
			{
				field = columns[i].headerFormatter.call(this,field);
			}
			td = tdTmpl;
			td = td.replace(/\{n\}/g,i);
			if(columns[i].width!=undefined)
			{
				columnStyle = columnStyle.replace(this.options.columnWidth , columns[i].width);
				columnStyle = columnStyle.replace(this.options.columnWidth , columns[i].width);
			}
			td = td.replace("{style}",columnStyle);

			if(this.options.isSort!=undefined && this.options.isSort)  /* header sort */
			{
				tds = tds + td.replace("{content}",field + this.sortHTML);
			}
			else
			{
				tds = tds + td.replace("{content}",field);
			}

			if(this.options.mergeHeader != undefined)
			{
				if(mergeIndex<this.mergeHeader.length)
				{
					if(this.mergeHeader[mergeIndex].start==i)
					{
						mTd = mTdTmpl;
						mTd = mTd.replace("{n}",i);
						mTd = mTd.replace("{coln}",this.mergeHeader[mergeIndex].length);
						mTds = mTds + mTd.replace("{content}",this.mergeHeader[mergeIndex].caption);
						mergeIndex++;
					}
					else if(this.mergeHeaderString.indexOf(i.toString())==-1)
					{
						td = tdTmpl;
						td = td.replace("{n}",i);
						mTds = mTds + td.replace("{content}","&nbsp;");
					}
				}
			}/*end if mergeHeader*/

		}

		if(this.options.mergeRow != undefined)
		{
			tds = '<td class="fixedGrid-sharp">&nbsp;</td>'+ tds;
		}
		tr = trTmpl;
		tr = tr.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-1");
		trs = tr.replace("{content}",tds);

		mTr = trTmpl;
		mTr = mTr.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-0");
		mTrs = mTr.replace("{content}",mTds);
		if(this.options.mergeHeader!=undefined)
		{
			trs = mTrs + trs;
		}
		tableHeader2 = tableHeader2.replace("{content}", trs);
		/*--draw header end --*/

		viewHeaderHTML1 = viewHeaderHTML1.replace("{content}",tableHeader1);
		viewBodyHTML1 = viewBodyHTML1.replace("{content}",tableBody1);

		viewHeaderHTML2 = viewHeaderHTML2.replace("{content}",tableHeader2);
		viewBodyHTML2 = viewBodyHTML2.replace("{content}",tableBody2);

		topDivView1HTML = topDivView1HTML.replace("{content}",viewHeaderHTML1 + viewBodyHTML1);
		topDivView2HTML = topDivView2HTML.replace("{content}",viewHeaderHTML2 + viewBodyHTML2);

		//topDivHTML = topDivHTML.replace("{content}",topDivView1HTML + topDivView2HTML);
		//this.$parent[0].innerHTML = topDivHTML;
		this.topDivHTML.innerHTML = topDivView1HTML + topDivView2HTML;
	}
	else if(this.options.fixedCol!=undefined&&this.options.fixedCol>0) 
	{
		for(i=baseN ; i<len+baseN ; i++) 
		{
			if(this.options.mergeRow != undefined) 
			{
				if(mergeIndex<this.mergeRow.length)
				{
					if(this.mergeRow[mergeIndex].start==i)
					{
						mTd = mTdTmplR;
						mTd = mTd.replace("{n}","rowspan-"+i);
						mTd = mTd.replace("{rown}",this.mergeRow[mergeIndex].length);
						mTd = mTd.replace("{content}",this.mergeRow[mergeIndex].caption);
						maxEnd = this.mergeRow[mergeIndex].end;
						mergeIndex++;
					}
					else if(this.mergeRowString.indexOf(i.toString())==-1)
					{
						td = tdTmpl;
						td = td.replace("{n}","empty-" + i + " fixedGrid-col-empty fixedGrid-rowspan");
						mTd = td.replace("{content}","&nbsp;");
					}
					else
					{
						mTd ="";
					}
				}
				else if(i>maxEnd)
				{
					mTd = tdTmpl;
					mTd = mTd.replace("{n}","empty-" + i + " fixedGrid-col-empty fixedGrid-rowspan");
					mTd = mTd.replace("{content}","&nbsp;");
				}
			} /*end if mergeRow*/

			tr = trTmpl;
			tr2 = trTmpl;
			tr = tr.replace(/\{n\}/g,i);
			tr2 = tr2.replace(/\{n\}/g,i);
			colIndex = 0;
			for(v in rows[i])
			{
				columnStyle =this.columnStyle;
				fieldValue = rows[i][v];
				resultObject.rows = rows;
				resultObject.rowIndex = i;
				resultObject.text = fieldValue;
				if(columns[colN]!=undefined && columns[colN].formatter!=undefined)
				{
					resultObject.column = columns[colN];
					fieldValue = columns[colN].formatter.call(this , resultObject);
					if(fieldValue == undefined)
					{
						fieldValue = resultObject.text; /*如果fieldValue没有返回值时，恢复原值*/
					}
				}
				
				if(columns[colN]!=undefined && columns[colN].width!=undefined)
				{
					columnStyle = columnStyle.replace(this.options.columnWidth , columns[colN].width);
					columnStyle = columnStyle.replace(this.options.columnWidth , columns[colN].width);
				}

				if(colN<this.options.fixedCol)
				{
					td = tdTmpl;
					td = td.replace(/\{n\}/g,colIndex);
					td = td.replace("{style}",columnStyle);
					tds = tds + td.replace("{content}",fieldValue);
				}
				else
				{
					td2 = tdTmpl;
					td2 = td2.replace(/\{n\}/g,colIndex);
					td2 = td2.replace("{style}",columnStyle);
					tds2 = tds2 + td2.replace("{content}",fieldValue);
				}
				colN++;
				colIndex++;
			}

			if(this.options.mergeHeader!=undefined)
			{
				mTd = "";
			}
			if(mTd==undefined)
			{
				mTd = "";
			}
			trs = trs + tr.replace("{content}", mTd + tds);
			trs2 = trs2 + tr.replace("{content}", tds2);
			tds = "";
			tds2= "";
			mTd = "";
			colN=0;
		}/*end for 绘制数据*/
		tableBody1 = tableBody1.replace("{content}",trs);
		tableBody2 = tableBody2.replace("{content}",trs2);

		/*draw header begin*/
		for(i=0;i<columns.length;i++)
		{
			columnStyle =this.columnStyle;
			field = columns[i].caption || columns[i].field;
			if(columns[i].headerFormatter!=undefined)
			{
				field = columns[i].headerFormatter.call(this,field);
			}

			if(columns[i].width!=undefined)
			{
				columnStyle = columnStyle.replace(this.options.columnWidth , columns[i].width);
				columnStyle = columnStyle.replace(this.options.columnWidth , columns[i].width);
			}

			if(colN<this.options.fixedCol)
			{
				td = tdTmpl;
				td = td.replace(/\{n\}/g,i);
				td = td.replace("{style}" , columnStyle);
				if(this.options.isSort!=undefined && this.options.isSort)  /* header sort */
				{
					tds = tds + td.replace("{content}",field + this.sortHTML);
				}
				else
				{
					tds = tds + td.replace("{content}",field);
				}
			}
			else
			{
				td2 = tdTmpl;
				td2 = td2.replace(/\{n\}/g,i);
				td2 = td2.replace("{style}" , columnStyle);
				if(this.options.isSort!=undefined && this.options.isSort)  /* header sort */
				{
					tds2 = tds2 + td2.replace("{content}",field + this.sortHTML);
				}
				else
				{	
					tds2 = tds2 + td2.replace("{content}",field);
				}
			}

			if(this.options.mergeHeader != undefined) 
			{
				if(mergeIndex<this.mergeHeader.length)
				{
					if(colN<this.options.fixedCol)
					{
						if(this.mergeHeader[mergeIndex].start==i)
						{
							mTd = mTdTmpl;
							mTd = mTd.replace("{n}",i);
							mTd = mTd.replace("{coln}",this.mergeHeader[mergeIndex].length);
							mTds = mTds + mTd.replace("{content}",this.mergeHeader[mergeIndex].caption);
							mergeIndex++;
						}
						else if(this.mergeHeaderString.indexOf(i.toString())==-1)
						{
							td = tdTmpl;
							td = td.replace("{n}",i);
							mTds = mTds + td.replace("{content}","&nbsp;");
						}
					}
					else
					{
						if(this.mergeHeader[mergeIndex].start==i)
						{
							mTd2 = mTdTmpl;
							mTd2 = mTd2.replace("{n}",i);
							mTd2 = mTd2.replace("{coln}",this.mergeHeader[mergeIndex].length);
							mTds2 = mTds2 + mTd2.replace("{content}",this.mergeHeader[mergeIndex].caption);
							mergeIndex++;
						}
						else if(this.mergeHeaderString.indexOf(i.toString())==-1)
						{
							td = tdTmpl;
							td = td.replace("{n}",i);
							mTds2 = mTds2 + td.replace("{content}","&nbsp;");
						}						
					}
				}
			}

			
			if(this.options.mergeRow != undefined)  /*mergeRow*/
			{
				mTd = '<td class="fixedGrid-sharp">&nbsp;</td>';
			}
			/*end if mergeRow*/

			colN++;
		}
		/*draw header end*/

		tr = trTmpl;
		tr = tr.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-1");
		if(this.options.mergeRow!=undefined)
		{
			tds = mTd + tds;
		}
		trs = tr.replace("{content}",tds);

		mTr = trTmpl;
		mTr = mTr.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-0");
		mTrs = mTr.replace("{content}",mTds);
		if(this.options.mergeHeader!=undefined)
		{
			trs = mTrs + trs;
		}
		tableHeader1 = tableHeader1.replace("{content}",trs);

		tr2 = trTmpl;
		tr2 = tr2.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-1");
		trs2 = tr2.replace("{content}",tds2);
		mTr2 = trTmpl;

		mTr2 = mTr2.replace("fixedGrid-row-{n}" , "fixedGrid-header-row-0");
		mTrs2 = mTr2.replace("{content}",mTds2);
		if(this.options.mergeHeader!=undefined)
		{
			trs2 = mTrs2 + trs2;
		}
		tableHeader2 = tableHeader2.replace("{content}",trs2);
		/*draw header end*/

		viewHeaderHTML1 = viewHeaderHTML1.replace("{content}",tableHeader1);
		viewBodyHTML1 = viewBodyHTML1.replace("{content}",tableBody1);

		viewHeaderHTML2 = viewHeaderHTML2.replace("{content}",tableHeader2);
		viewBodyHTML2 = viewBodyHTML2.replace("{content}",tableBody2);

		topDivView1HTML = topDivView1HTML.replace("{content}",viewHeaderHTML1 + viewBodyHTML1);
		topDivView2HTML = topDivView2HTML.replace("{content}",viewHeaderHTML2 + viewBodyHTML2);


		this.topDivHTML.innerHTML = topDivView1HTML + topDivView2HTML;
	}/*end if*/



	if(this.options.isMatrix!=undefined && this.options.isMatrix)
	{
		$(this.parentName + " .fixedGrid-view1 table").removeClass("matrix");
		$(this.parentName + " .fixedGrid-view2 table").removeClass("matrix");
		$(this.parentName + " .fixedGrid-view1 table").addClass("matrix");
		$(this.parentName + " .fixedGrid-view2 table").addClass("matrix");
	}
	this.setBox();
	this.processHandler.call(this);

}/**end initData**/


fixedGrid.prototype.setBox = function(){

	var backObject = {};
	var columns = this.options.columns;

	var th = this;
	var headerHight = $($(this.parentName + " .fixedGrid-header")[1]).height();
	$(this.parentName + " .fixedGrid-header").height(headerHight);
	if(this.options.height=="auto")
	{
		$(this.parentName + " .fixedGrid-body").height($(this.parentName + " .fixedGrid-body table").height()+10);
	}
	else
	{
		$(this.parentName + " .fixedGrid-body").height(this.options.height - headerHight);
	}
	$(this.parentName + " .fixedGrid-body").css("position","relative");
	$(this.parentName + " .fixedGrid-view1 .fixedGrid-body").css("overflow","hidden");
	$(this.parentName + " .fixedGrid-header").css("position","relative");
	$(this.parentName + " .fixedGrid-view2 .fixedGrid-body").css("overflow","auto");
	$(this.parentName + " .fixedGrid-body table").css("position","absolute");
	$(this.parentName + " .fixedGrid-view2 .fixedGrid-header table").css("position","absolute");



	var $leftTable = $(this.parentName + " .fixedGrid-view1 .fixedGrid-body table");
	var $rightTopTable = $(this.parentName + " .fixedGrid-view2 .fixedGrid-header table");

	$(this.parentName + " .fixedGrid-view2 .fixedGrid-body").unbind().bind("scroll",function(){
		if($leftTable[0]!=undefined)
		{
			$leftTable[0].style.top = "-" + this.scrollTop + "px";
			$rightTopTable[0].style.left = "-" + this.scrollLeft + "px";
		}
		else 
		{
			$rightTopTable[0].style.left = "-" + this.scrollLeft + "px";
		}
	});
	/*end*/


	this.live("td","click",function(e){
		var target = e.target;
		var index = e.target.getAttribute("index");
		if(target.parentNode.className.indexOf("header")>0)
		{
			return;
		}
		if(columns[index].onClick!=undefined)
		{
			backObject.rows = this.options.newRows;
			backObject.text = target.innerHTML;
			backObject.rowIndex = parseInt(target.parentNode.getAttribute("index"));
			backObject.colIndex = index;
			backObject.column = columns[index];
			columns[index].onClick.call(this , backObject);
		}
	});
	/*end grid event*/

	var $headerTr = $(this.parentName + " .fixedGrid-view2 .fixedGrid-header tr");
	var $headerTrL = $(this.parentName + " .fixedGrid-view1 .fixedGrid-header tr");
	var $headerTd,$headerTdL;

	if($headerTr.length==2)
	{
		$headerTd = $($headerTr[1]).find("td");
		if($headerTrL.length!=0)
		{
			$headerTdL = $($headerTrL[1]).find("td");
		}
	}
	else
	{
		$headerTd = $($headerTr[0]).find("td");
		if($headerTrL.length!=0)
		{
			$headerTdL = $($headerTrL[0]).find("td");
		}
	}

	if($headerTd!=undefined)
	{
		if($headerTdL!=undefined)
		{
			for(i=0;i<$headerTdL.length;i++)
			{
				$headerTd.push($headerTdL[i]);
			}
		}
		$headerTd.each(function(index){
			var i;
			var columns = th.options.columns;
			var len = columns.length;
			for(i=0;i<len;i++)
			{
				if(this.innerHTML == columns[i].caption && columns[i].tip!=undefined)
				{
					this.setAttribute("title",columns[i].tip);
				}
			}
		});
	}

}/*end setBox*/


fixedGrid.prototype.createPage = function(){
	var This = this;

	var pageHTML = '<dt id="nextPage" class="nextPage" style="float:right;cursor:pointer">下一页</dt>'+
	               '<dd style="float:right;margin:0;padding:0;cursor:pointer" class="pageNumber">'+
	               '{content}'+
	               '</dd>'+
	               '<dt id="prevPage" class="prevPage" style="float:right;cursor:pointer">上一页</dt>';
	var pageStr ="";
	var numberHTML = '<span style="float:left;" class="fixedGrid-number {btnclass}">{n}</span>';
	var numberStr = "" , numberStrSum="";
	var a,b,c;  
	var i , baseN=1;

	if(this.pageObject.pageDOM==undefined)
	{
		this.pageObject.pageDOM = document.createElement("dl");
		this.pageObject.curPage = 1;
	}
	this.pageObject.pageDOM.style.margin = "0";
	this.pageObject.pageDOM.style.padding = "0";
	this.pageObject.pageDOM.style.overflow = "hidden";
	this.pageObject.pageDOM.className = "fixedGridPage";
	try
	{
		this.pageObject.recordCount = this.options.recordCount || this.options.newRows.length;
	}catch(e)
	{
		this.pageObject.recordCount = 10;
	}
	this.pageObject.pageSize = this.options.pageSize || this.pageObject.recordCount;
	a = this.pageObject.recordCount;
	b = this.pageObject.pageSize;
	c = a%b==0 ? a/b : parseInt(a/b)+1;
	this.pageObject.pageCount = c;
	this.$parent[0].appendChild(this.pageObject.pageDOM);

	for(i=baseN;i<=baseN+5;i++)
	{
		if(i>this.pageObject.pageCount)
		{
			break;
		}
		numberStr = numberHTML;
		if(i==baseN)
		{
			numberStr = numberStr.replace("{btnclass}","fixedGrid-number-first");
		}
		else if(i==baseN+5)
		{
			numberStr = numberStr.replace("{btnclass}","fixedGrid-number-last");
		}
		numberStr = numberStr.replace("{btnclass}","");
		numberStrSum += numberStr.replace("{n}",i);
	}
	pageHTML = pageHTML.replace("{content}",numberStrSum);

	this.pageObject.pageDOM.innerHTML = pageHTML;

	$($(this.parentName + " .fixedGridPage span")[0]).addClass("fixedGrid-number-select"); /*默认选中第一页*/

	/*### bind page Event ###*/

	var $string = " .fixedGridPage .pageNumber span";
	var $this , $allSpan = $(this.parentName + $string);

	/*prev page begin*/
	$(this.parentName + " .fixedGridPage #prevPage").unbind().bind("click", function(){
		This.pageObject.curPage--;
		if(This.pageObject.curPage<=0)
		{
			This.pageObject.curPage = 1;
			return;
		}
		This.initData({
			pageIndex : This.pageObject.curPage,
			isAjax    : false
		});

		var lastValue = parseInt($allSpan[0].innerHTML);
		$allSpan.each(function(index){
			var spanValue = parseInt(this.innerHTML);
			if(spanValue == This.pageObject.curPage)
			{
				$allSpan.removeClass("fixedGrid-number-select");
				$(this).addClass("fixedGrid-number-select");
			}
			if(lastValue>1)
			{
				this.innerHTML = spanValue - 1;
				if(spanValue == This.pageObject.curPage)
				{
					$allSpan.removeClass("fixedGrid-number-select");
					$(this).next().addClass("fixedGrid-number-select");
				}
			}
		});/*end each*/
	});
	/*prev page end*/

	/*next page begin*/
	$(this.parentName + " .fixedGridPage #nextPage").unbind().bind("click", function(){
		This.pageObject.curPage++;
		if(This.pageObject.curPage > This.pageObject.pageCount)
		{
			This.pageObject.curPage = This.pageObject.pageCount;
			return;
		}
		This.initData({
			pageIndex : This.pageObject.curPage,
			isAjax    : false
		});

		var lastValue = parseInt($allSpan[$allSpan.length-1].innerHTML);
		$allSpan.each(function(index){
			var spanValue = parseInt(this.innerHTML);
			if(spanValue == This.pageObject.curPage)
			{
				$allSpan.removeClass("fixedGrid-number-select");
				$(this).addClass("fixedGrid-number-select");
			}
			if(lastValue<This.pageObject.pageCount)
			{
				this.innerHTML = spanValue + 1;
				if(spanValue == This.pageObject.curPage)
				{
					$allSpan.removeClass("fixedGrid-number-select");
					$(this).prev().addClass("fixedGrid-number-select");
				}
			}
		});/*end each*/
	});
	/*next page end*/

	
	$(this.parentName + $string).unbind().bind("click", function(e){
		This.pageObject.curPage = parseInt(this.innerHTML);
		This.initData({
			pageIndex : This.pageObject.curPage,
			isAjax    : false
		});

		$allSpan.removeClass("fixedGrid-number-select");
		$this = $(this);
		$this.addClass("fixedGrid-number-select");
		var curSpanValue = parseInt(e.target.innerHTML);

		
		if(e.target.className.indexOf("fixedGrid-number-last")>0)
		{
			if(curSpanValue>=This.pageObject.pageCount)
			{
				return;
			}
			$allSpan.removeClass("fixedGrid-number-select");

			$allSpan.each(function(index){
				var spanIndex = parseInt(this.innerHTML);
				if(This.pageObject.pageCount-curSpanValue==1)
				{
					this.innerHTML = spanIndex + 1;
					$this.prev().addClass("fixedGrid-number-select");
				}
				else
				{
					this.innerHTML = spanIndex + 2;
					$this.prev().prev().addClass("fixedGrid-number-select");
				}
			});
		}

		if(e.target.className.indexOf("fixedGrid-number-first")>0)
		{
			if(curSpanValue<=1)
			{
				return;
			}
			$allSpan.removeClass("fixedGrid-number-select");

			$allSpan.each(function(index){
				var spanIndex = parseInt(this.innerHTML);
				if(curSpanValue<=2)
				{
					this.innerHTML = spanIndex - 1;
					$this.next().addClass("fixedGrid-number-select");

				}
				else
				{
					this.innerHTML = spanIndex - 2;
					$this.next().next().addClass("fixedGrid-number-select");
				}
			});
		}

	});	
	/*end 页码单击处理*/

	/*###  end bind page Event ###*/

	if(this.options.newRows==undefined)
	{
		this.hidePage();
	}
	else if(this.options.newRows.length==0)
	{
		this.hidePage();
	}
	else
	{
		this.showPage();
	}

}
/*end function createPage*/


fixedGrid.prototype.getMatrix = function(_rows_){
	var object = {};
	var i,j,v,n=0;
	var rows = [] , rlen , clen;
	var matrix = [] , newMatrix = [];
	var columns = this.options.columns;
	rows = _rows_ || this.options.newRows;

	for(i=0;i<columns.length;i++)
	{
		object["column"+i] = columns[i].caption;
	}
	rows.unshift(object);

	rlen = rows.length;
	clen = rows[0].length;

	for(i=0;i<rlen;i++)
	{
		matrix[i] = [];
		n = 0;
		for(v in rows[i])
		{
			matrix[i][n] = rows[i][v];
			n++;
		}
	}

	rlen = matrix.length;
	clen = matrix[0].length;	
	for(i=0;i<clen;i++)
	{
		newMatrix[i] = [];
		for(j=0;j<rlen;j++)
		{
			newMatrix[i][j] = matrix[j][i];
		}
	}

	rlen = newMatrix.length;
	clen = newMatrix[0].length;
	rows = [];
	for(i=0;i<rlen;i++)
	{
		rows[i] = {};
		for(j=0;j<clen;j++)
		{
			rows[i][i+"_"+j] = newMatrix[i][j];
		}
	}
	
	this.options.columns.length = clen;
	for(i=0;i<clen;i++)
	{
		if(this.options.columns[i]==undefined)
		{
			this.options.columns[i] = {};
		}
		this.options.columns[i].caption = newMatrix[0][i];
	}
	rows.shift();
	this.options.newRows = rows;

	return rows;
}
/*end function getMatrix*/

/*处理函数*/
fixedGrid.prototype.process = function(f){
	this.processHandler = f || function(){};
}



fixedGrid.prototype.loadData = function(rows){
	if(rows!=undefined)
	{
		this.exchangeData(rows);
	}
	if(this.options.isMatrix!=undefined && this.options.isMatrix)
	{
		this.getMatrix();
	}
	this.initData();
	/* create page */
	this.createPage();
	/*create page end*/
	if(this.options.onLoad != undefined)
	{
		this.options.onLoad.call(this);
	}
	this.processHandler.call(this);
}


/******************
设置数据参数
******************/
fixedGrid.prototype.setOptions = function(options){
	var curOptions = this.options;
	var v;
	for(v in options)
	{
		if(v=="columnWidth")
		{
			$(this.parentName + " td").each(function(index){
				var width = (this.style.width.replace("px",""));
				//if(width == This.options.columnWidth)
				{
					this.style.width = options["columnWidth"]+"px";
					this.style.minWidth = options["columnWidth"]+"px";
				}
			});
		}

		this.options[v] = options[v];
		if(v=="mergeHeader")
		{
			this.options.isMatrix = false;
			this.getMergeHeader();
			this.options["mergeRow"] = undefined;
		}
		if(v=="mergeRow")
		{
			this.options.isMatrix = true;
			this.getMergeRow();
			this.options["mergeHeader"] = undefined;
		}
		this.columnStyle = "width:"+this.options.columnWidth+"px;min-width:"+this.options.columnWidth+"px;";
	}
}


/************
类型：外部接口
显示分页区
************/
fixedGrid.prototype.showPage = function(){
	$(this.parentName + " .fixedGridPage").show();
}

/************
类型：外部接口
隐藏分页区
************/
fixedGrid.prototype.hidePage = function(){
	$(this.parentName + " .fixedGridPage").hide();
}

/************
类型：外部接口
刷新数据
************/
fixedGrid.prototype.refresh = function(){
	this.initData({

	});
}


fixedGrid.prototype.live = function(targetStr, type , f){
	var th = this;
	if(typeof(window[targetStr+"_"+type])=="function")
	{
		return;
	}
	window[targetStr+"_"+type] = f;
	if(window.attachEvent!=undefined)
	{
		this.$parent[0].attachEvent("on"+type , function(){
			th.event.target = event.srcElement;
			if(th.event.target.nodeName == targetStr.toUpperCase())
			{
				f.call(th,th.event);
			}
		});
	}
	else
	{
		this.$parent[0].addEventListener(type , function(e){
			th.event.target = e.target;
			if(th.event.target.nodeName == targetStr.toUpperCase())
			{
				f.call(th,th.event);
			}
		} , false);
	}
	this.eventHandler.push(f);
}

