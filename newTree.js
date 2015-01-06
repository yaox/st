/*
	2011-12-26
	实现需求：
	1、树节点展开时才生成其叶子节点的html
	2、树节点关闭时删除其叶子节点的html //ps：此处是不对的，删除节点对页面响应没有太多性能提升 2011-12-27 测试结果
	3、树的事件控制在最顶层的html节点上，使用顶层节点来代理树叶子节点的html事件 
	4、使用组合模式实现树
	5、1和2点可以使用一个属性来配置，
	6、实现动态插入，删除树节点的功能。
	7、实现前面树的全部功能
	8、实现插件功能。插件是只在树中加入相应功能时候直接配置插件方式实现。

	以上需求是在功能和性能上的一个加强，同时要求使用新的插件和组合模式使树具有扩展性。
	2012-01-02 对node的节点的html构造方法进行优化，字符串拼接改由+改为数组join,性能大幅上升
*/
ST.tree={};
ST.tree.sGIF='st/images/default/tree/s.gif'
ST.tree.TreeNode= ST.extend(ST.Container, {
	eltag:'li',
	isRoot:false,
	initComponent : function() {
		this.sGIF=ST.tree.sGIF;
		ST.tree.TreeNode.superClass.initComponent.call(this);
		if(this.isRoot){
			this.eltag='ul';
		}
		this.id=this.data.st_id;
		if(this.isRoot){
			this.lazyRender=false;
		}
	},
	onRender : function(ct, position) {
		ST.tree.TreeNode.superClass.onRender.call(this, ct, position);
	},
	renderBody:function(){
		if(this.isRoot){
			this.el.className='x-tree-root-ct x-tree-arrows x-tree-lines';
			this.body=document.createElement("div");
			this.body.className='x-tree-root-node';
			this.el.appendChild(this.body);
		}else{
			this.el.className='x-tree-node';		
			this.el.innerHTML=[
					'<div style="position: relative;" class="x-tree-node-el ',this.data.children?'x-tree-node-collapsed':'x-tree-node-leaf',' x-unselectable" unselectable="on" id="',this.id,'-nodeEl">',
					"<div style='position: absolute;right:20px;font-size:0px;' class='my-arrow'></div>",
					'<span class="x-tree-node-indent">',this.createIndent(this.data), '</span>',
					this.createElbowPlus(this.data)
					,'<img src="',this.sGIF,'" class="x-tree-node-icon ', this.data.data.cls,'" unselectable="on" id="',this.id,'-node-icon">' 
					, '<a hidefocus="on" style="display:inline-block;" class="x-tree-node-anchor" href="', this.data.url ,'" title="' , this.data.name , '" tabindex="1" id="',this.id,'-node-anchor">'
					, '<span unselectable="on" qtip="" id="',this.id,'-node-text">' , this.data.name , '</span></a></div>',
					'<ul class="x-tree-node-ct" style="display:none;"></ul>'
				].join('');
			this.nodeEl=this.el.childNodes[0];
			
			this.body = this.el.childNodes[1];
		}		
		this.items=[];
		if(this.data&&this.data.children){
			var children=this.data.children;
			for(var i=0;i<children.length;i++){
				this.items.push(new ST.tree.TreeNode({data:children[i]}));
			}
		}
	},

	createLeafClass : function(node) {
		if (node.children)
			return 'x-tree-node-collapsed';
		return 'x-tree-node-leaf';
	},
	createIndent : function(node) {
		var tempStr = [];
		var sGIF = this.sGIF;
		node=node.supNode
		while(node.supNode){
			tempStr.unshift()
			if (node.supNode.last) {
				tempStr.unshift('<img src="' + sGIF + '" class="x-tree-icon"/>');
			} else {
				tempStr.unshift('<img src="' + sGIF+ '" class="x-tree-elbow-line"/>');
			}
			node=node.supNode;
		}		
		return tempStr.join('');
		/*
		return getIndent(node).join('');

		function getIndent(node) {
			if (node.supNode) {
				getIndent(node.supNode)
				if (node.supNode.last) {
					tempStr.push('<img src="' + sGIF + '" class="x-tree-icon"/>');
				} else {
					tempStr.push('<img src="' + sGIF+ '" class="x-tree-elbow-line"/>');
				}
			}// else{tempStr+='<img src="'+sGIF+'" class="x-tree-icon">'}
			return tempStr;
		}*/
	},
	createElbowPlus : function(node) {
		if (node.children) {// 如果是父节点，(有子节点)
			if (node.last)
				return ['<img src="' , this.sGIF
						, '" class="x-tree-ec-icon x-tree-elbow-end-plus" id="',this.id,'-ec-icon"/>'].join('');
			else
				return ['<img src="' , this.sGIF
						, '" class="x-tree-ec-icon x-tree-elbow-plus" id="',this.id,'-ec-icon"/>'].join('');
		} else {// 不是父节点(没有子节点)
			if (node.last)
				return ['<img src="' , this.sGIF
						, '" class="x-tree-ec-icon x-tree-elbow-end" id="',this.id,'-ec-icon"/>'].join('');
			else
				return ['<img src="' , this.sGIF
						, '" class="x-tree-ec-icon x-tree-elbow" id="',this.id,'-ec-icon"/>'].join('');
		}
	},
	expand:function(){
		
		if(!this.isItemsRender){
			var i, len = this.items.length;
			for(i=0;i<len;i++){
				this.items[i].render(this,i);
			}
			//this.expanded=true;
		}
		if(!this.expanded){
			this.expanded=true;
			this.body.style.display="";
			var el=$D.getElementsByClassName("x-tree-node-el","div",this.el)[0]
			$D.removeClass(el, 'x-tree-node-collapsed');
			$D.addClass(el, 'x-tree-node-expanded');
			
			var bowEls=$D.getElementsByClassName("x-tree-elbow-end-plus","img",this.el);
			if(bowEls&&bowEls.length>0){
				$D.removeClass(bowEls[0], 'x-tree-elbow-end-plus');
				$D.addClass(bowEls[0], 'x-tree-elbow-end-minus');
			}
			bowEls=$D.getElementsByClassName("x-tree-elbow-plus","img",this.el);
			if(bowEls&&bowEls.length>0){
				$D.removeClass(bowEls[0], 'x-tree-elbow-plus');
				$D.addClass(bowEls[0], 'x-tree-elbow-minus');
			}
		}
	},
	collapse: function(){
		if(this.expanded){
			this.expanded=false;
			this.body.style.display="none";
			var el=$D.getElementsByClassName("x-tree-node-el","div",this.el)[0]
			$D.removeClass(el, 'x-tree-node-expanded');
			$D.addClass(el, 'x-tree-node-collapsed');
			
			var bowEls=$D.getElementsByClassName("x-tree-elbow-end-minus","img",this.el);
			if(bowEls&&bowEls.length>0){
				$D.removeClass(bowEls[0], 'x-tree-elbow-end-minus');
				$D.addClass(bowEls[0], 'x-tree-elbow-end-plus');
			}
			bowEls=$D.getElementsByClassName("x-tree-elbow-minus","img",this.el);
			if(bowEls&&bowEls.length>0){
				$D.removeClass(bowEls[0], 'x-tree-elbow-minus');
				$D.addClass(bowEls[0], 'x-tree-elbow-plus');
			}
			
			
		}
		
	},
	setSelected:function(){
		var el=$D.getElementsByClassName("x-tree-node-el","div",this.el)[0];
		$D.addClass(el, 'x-tree-selected');
		
		
	},
	setUnSelected:function(){
		var el=$D.getElementsByClassName("x-tree-node-el","div",this.el)[0];
		$D.removeClass(el, 'x-tree-selected');
		//alert(el.id+"----"+el.className)
	}

});
ST.tree.index=0;
ST.tree.TreeDataLoader=function(){
	this.createData=function(tree,data){
		if(ST.isArray(data)){
			data={id:"-1",name:'root',children:data};
		}
		return this.getLV(this.getTree(data));
	}
	this.getLV=function(node,lv){
		node.lv=lv + 1;
		if(node.children){
			for (var i = 0; i < node.children.length; i++) {
				if (i == node.children.length - 1)
					node.children[i].last = true;
				node.children[i].supNode = node;
				this.getLV(node.children[i], node.lv)
			}
		}
		return node;
	}	
	this.getTree=function(data){
		var node={};
		var array=[];
		if(data){
			node.id=data["id"];
			node.name=data["name"];
			node.st_expand=false;
			node.st_id="tree-node-"+ST.tree.index++;
			node.data=data;
		}
		if(data.children){
			array=data.children;
			node.children=[];
		}		
		for(var i=0;i<array.length;i++){
			node.children.push(this.getTree(array[i]))
		}
		return node;
	}
}
ST.tree.Tree= ST.extend(ST.Container, {
	//isUseColor:true,
	overHTML:"<div class='over-bg'><div class='over-left-bg'><div class='over-right-bg'></div></div></div>",
	selectedHTML:"<div class='selected-bg'><div class='selected-left-bg'><div class='selected-right-bg'></div></div></div>",
	treeBgHTML:"<div class='tree-bg'><div class='tree-left-bg'><div class='tree-right-bg'></div></div></div>",
	isExpandAll:false,
	initComponent : function() {
		ST.tree.Tree.superClass.initComponent.call(this);

		if(!this.dataLoader){
			this.dataLoader=new ST.tree.TreeDataLoader();
		}
		if(this.data){
			this.setData(this.data);
		}
		this.createRootNode();
		if(this.root && this.root.children && this.root.children.length ){
			for(var i=0;i<this.root.children.length;i++){
				this.root.children[i].st_expand=true;
			}
		}
	},
	setData:function(data){
		this.data=data;
		if(this.dataLoader)
			this.root=this.dataLoader.createData(this,data);		
	},
	createRootNode:function(){
		this.rootNode=new ST.tree.TreeNode({data:this.root,isRoot:true});
	},
	onRender : function(ct, position) {
		ST.tree.Tree.superClass.onRender.call(this, ct, position);
		if(this.rootNode){
			this.rootNode.render(this.body);
		}
		this.createBg();
		this.initEvent();
		
		if(this.isExpandAll){
			this.expandAll();
		}
		
		var xy=$D.getXY(this.rootNode.el);
		var txy=$D.getXY(this.el);
		this.treeBgEl.style.top=xy[1]-txy[1]+this.body.scrollTop+"px";
		this.treeBgEl.style.height=this.rootNode.el.offsetHeight+"px"
		this.treeBgEl.style.width=this.rootNode.el.offsetWidth+"px"
	},
	renderBody:function(){
		var warp=document.createElement('div');
		warp.className='x-panel-bwrap';
		this.body=document.createElement('div');
		this.body.className='x-panel-body x-panel-body-noheader'
		this.body.style.cssText='border:0px red solid;overflow-x:auto;overflow-y: auto; width: '
				+ (this.width) + 'px;'+' height: ' + this.height + 'px;';
		warp.appendChild(this.body);
		this.el.appendChild(warp);
	},
	createBg:function(){
		this.body.style.position="relative";
		this.body.style.zIndex="8";
		
		this.selectedBgEl=document.createElement('div');
		this.selectedBgEl.style.cssText="position:absolute;top:0px;left:0px;height:0px;z-index:-1;width:0px;";
		this.selectedBgEl.innerHTML=this.selectedHTML||"";
		this.body.appendChild(this.selectedBgEl);
		
		this.overBgEl=document.createElement('div');
		this.overBgEl.style.cssText="position:absolute;top:0px;left:0px;height:0px;z-index:-2;width:0px;";
		this.overBgEl.innerHTML=this.overHTML||"";
		this.body.appendChild(this.overBgEl);
		
		this.treeBgEl=document.createElement('div');
		this.treeBgEl.style.cssText="position:absolute;top:0px;left:0px;height:0px;z-index:-3;width:0px;";
		this.treeBgEl.innerHTML=this.treeBgHTML||"";
		this.body.appendChild(this.treeBgEl);
	},
	initEvent:function(){
		$E.on(this.el,'click',this.onClick,this,true);
		$E.on(this.el,'mouseover',this.onMouseOver,this,true);
		$E.on(this.el,'mouseout',this.onMouseOut,this,true);
		$E.on(this.body,'scroll',this.onScroll,this,true);
		$E.on(this.rootNode.el,"click",this.onRootNodeClick,this,true);
		

	},
	onRootNodeClick:function(e){
		var _this=this;
		setTimeout(function(){
			var xy=$D.getXY(_this.rootNode.el);
			var txy=$D.getXY(_this.el);
			_this.treeBgEl.style.top=xy[1]-txy[1]+_this.body.scrollTop+"px";
			_this.treeBgEl.style.height=_this.rootNode.el.offsetHeight+"px"
			_this.treeBgEl.style.width=_this.rootNode.el.offsetWidth+"px"
		},100)
		
	},
	onClick:function(e,u){
		$E.preventDefault(e);
		var t=e.target||e.srcElement;
		if($D.hasClass(t,'x-tree-ec-icon')||$D.hasClass(t,'x-tree-node-icon')){
			var id=t.id.replace('-ec-icon','').replace('-node-icon','');
			
			var node=this.getTreeNode(id);
			var treeNode=ST.cache[node.st_id];
			ST.log(t.outerHTML+"\r\n"+node.st_id);
			
			if(node.children){
				if(treeNode.expanded){
					treeNode.collapse();
				}else{
					treeNode.expand();
				}
			}	
			this.setSelectNode(treeNode)
			return;
		}
		
		while(!$D.hasClass(t,'x-tree-node-el')){
			t=t.parentNode;
		}
		if(t){						
			var id=t.id.replace('-nodeEl','');
			var node=this.getTreeNode(id);
			var treeNode=ST.cache[node.st_id];
			this.setSelectNode(treeNode)
			this.fireEvent("nodeClick",treeNode,node,this);			
		}
	},
	setSelectNode:function(node){
		//this.currNode=node;
		var xy=$D.getXY(node.el);
		var txy=$D.getXY(this.el);
		this.selectedBgEl.style.top=xy[1]-txy[1]+this.body.scrollTop+"px";
		this.selectedBgEl.oh=xy[1]-txy[1]+this.body.scrollTop;
		this.selectedBgEl.style.height=node.nodeEl.offsetHeight+"px"
		this.selectedBgEl.style.width=node.nodeEl.offsetWidth+"px";
		this.overBgEl.style.width=node.nodeEl.offsetWidth+"px";
		if(this.selectedColor)//&&!this.selectedHTML
			this.selectedBgEl.style.background=this.selectedColor||"#fdf2a2";
		
		//以下为老的setSelected处理方法
		if(this.currNode){
			this.currNode.setUnSelected();
		}
		this.currNode=node;
		node.setSelected();
		//end老的setSelected处理方法
	},
	onMouseOver:function(e){
		$E.preventDefault(e);
		//ST.log("e.toElement="+e.toElement);
		var to=e.toElement;
		if(to&&to.id!=this.el.id){
			while(to.parentNode && !$D.hasClass(to,'x-tree-node-el')){
				to=to.parentNode;
			}//alert(to.id)
			if(!to.parentNode) return;
			var id=to.id.replace('-nodeEl','');
			var node=this.getTreeNode(id);
			var treeNode=ST.cache[node.st_id];
			
			var xy=$D.getXY(treeNode.el);
			var txy=$D.getXY(this.el);
			
			this.overBgEl.style.top=xy[1]-txy[1]+this.body.scrollTop+"px";
			this.overBgEl.oh=xy[1]-txy[1]+this.body.scrollTop;
			this.overBgEl.style.height=treeNode.nodeEl.offsetHeight+"px"
			this.overBgEl.style.width=treeNode.nodeEl.offsetWidth+"px"
			if(this.overColor)//&&!this.overHTML
				this.overBgEl.style.background=this.overColor||"#D9E8FB";
			
			//add by yaoym 	2014-04-26 增加nodeOver事件触发
			if(this._node_over && this._node_over!=node){
				this._node_over=node;
				this.fireEvent("nodeOver",treeNode,node)
			}
			if(!this._node_over){
				this._node_over=node;
				this.fireEvent("nodeOver",treeNode,node)
			}	
			//end add 			
		}
		
		
		//return;
		//以下为老的over处理方法
		$E.preventDefault(e);
		if(this._over_node_id){
			$D.removeClass($(this._over_node_id),'x-tree-node-over');
		}
		/*
		var overs=$D.getElementsByClassName('x-tree-node-over','div',this.el);
		for(var i=0;i<overs.length;i++){
			$D.removeClass(overs[i],'x-tree-node-over');
		}	*/	
		var node=e.toElement;
		if(node.id!=this.el.id){
			while(!$D.hasClass(node,'x-tree-node-el')){
				node=node.parentNode;
			}
			$D.addClass(node,'x-tree-node-over');
			this._over_node_id=node.id;
		}
		//老的over处理方法 end
		
	},
	onMouseOut:function(e){
		$E.preventDefault(e);
		var pos=$D.getXY(this.el);
		var ep=$E.getXY(e);		
		if(ep[1]>=pos[1]+this.el.offsetHeight||ep[1]<=pos[1]||ep[0]>=pos[0]+this.el.offsetWidth||ep[0]<=pos[0]){
			this.overBgEl.style.top="-10000px";
		}
		//return 
		
		//以下啊为老的over方法
		$E.preventDefault(e);
		var pos=$D.getXY(this.el);
		var ep=$E.getXY(e);		
		if(ep[1]>=pos[1]+this.el.offsetHeight||ep[1]<=pos[1]||ep[0]>=pos[0]+this.el.offsetWidth||ep[0]<=pos[0]){
			if(this._over_node_id){
				$D.removeClass($(this._over_node_id),'x-tree-node-over');
			}
			/*
			var overs=$D.getElementsByClassName('x-tree-node-over','div',this.el);
			for(var i=0;i<overs.length;i++){
				$D.removeClass(overs[i],'x-tree-node-over');
			}*/
		}
		//老的over处理方法 end
		
	},
	onScroll:function(e){return;
		$E.preventDefault(e);
		this.overBgEl.style.top=this.overBgEl.oh-this.body.scrollTop+"px";
		this.selectedBgEl.style.top=this.selectedBgEl.oh-this.body.scrollTop+"px";
		
	},
	getTreeNode:function(id,node){
		if(!node){
			node=this.root;
		}
		var	children=node.children;
		if(children&&children.length>0){
			
			for(var i=0;i<children.length;i++){
				if(children[i]['st_id']==id){
					return children[i];
				}else{
					var temp=this.getTreeNode(id,children[i])
					if(temp){
						return temp;
					}				
				}
			}
		}
		return null;
	},
	getTreeNodeByDataId:function(id,node){
		if(!node){
			node=this.root;
		}
		var	children=node.children;
		if(children&&children.length>0){
			
			for(var i=0;i<children.length;i++){
				if(children[i]['id']==id){
					return children[i];
				}else{
					var temp=this.getTreeNodeByDataId(id,children[i])
					if(temp){
						return temp;
					}				
				}
			}
		}
		return null;		
	},
	select:function(dataId){
		var node=this.getTreeNodeByDataId(dataId);
		var tempNode=node;
		while(tempNode.supNode){	
			tempNode=tempNode.supNode;
			var treePNode=ST.cache[tempNode.st_id];
			treePNode.expand();
		}
		
		var treeNode=ST.cache[node.st_id];
		treeNode.expand();
		this.setSelectNode(treeNode);
		this.fireEvent("nodeClick",treeNode,node,this);		
	},
	expandAll:function(node){
		if(!node){
			node=this.rootNode;
		}
		node.expand();
		for(var i=0;i<node.items.length;i++){
			
			this.expandAll(node.items[i]);
		}
	}
	
});


