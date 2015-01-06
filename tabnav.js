ST.TabNav=ST.extend(ST.Container,{
	eltag:"div",
	lazyRender:false,
	initComponent: function(){
		ST.TabNav.superClass.initComponent.call(this);
	},
	renderBody:function(){
		this.el.className="nav";
		this.body=document.createElement("ul");
		this.body.className="nav-list";
		this.el.appendChild(this.body);
	},
	onRender : function(ct, position) {
		ST.TabNav.superClass.onRender.call(this, ct, position);
		this.setActive(0);
		this.initEvent();
	},
	setActive:function(index,p){//p为 额外参数
		var activeNav=null;
		if(typeof(index)=="object"){
			activeNav=index;
			for(var i=0;i<this.items.length;i++){
				if(this.items[i].id==activeNav.id){
					this.items[i].selected();
					index=i;
				}else{
					this.items[i].unSelected();
				}
			}
		}else{
			for(var i=0;i<this.items.length;i++){
				if(i==index){
					activeNav=this.items[i];
					this.items[i].selected();
				}else{
					this.items[i].unSelected();
				}
			}
		}		
		this.fireEvent("ontabchange",activeNav,index,p);
	},
	initEvent:function(){
		$E.on(this.el,'click',this.onClick,this,true);
	},
	onClick:function(e){
		$E.preventDefault(e);
		var t=e.target||e.srcElement;
		//ST.log(t.id+"    "+t.tagName)
		if(t.tagName=="LI"){
			this.setActive(ST.cache[t.id]);
		}
	}
});
ST.NavNode=ST.extend(ST.Component,{
	eltag:"li",
	initComponent: function(){
		ST.NavNode.superClass.initComponent.call(this);
	},
	onRender : function(ct, position) {
		ST.NavNode.superClass.onRender.call(this, ct, position);
		this.el.innerHTML=this.name
	},
	selected :function(){
		this.el.className="selceted";
	},
	unSelected:function(){
		this.el.className="";
	}
});

ST.TreeFrameNav=ST.extend(ST.Container,{
	eltag:"div",
	lazyRender:false,
	initComponent: function(){
		ST.TreeFrameNav.superClass.initComponent.call(this);
	},
	renderBody:function(){
		this.el.className="content clearfix ";
		this.body=this.el;
	},
	onRender : function(ct, position) {
		ST.TreeFrameNav.superClass.onRender.call(this, ct, position);
		for(var i=0;i<this.items.length;i++){			
			this.items[i].on("treeClick",this.onTreeClick,this);
		}
	},
	onTreeClick:function(node,data,tree,treeFrame){
		this.currTreeFrame=treeFrame;
		this.fireEvent("treeClick",node,data,treeFrame.frame,tree);
	},
	setActive:function(index,p){
		if(this.currTreeFrame){
			this.currTreeFrame.hide();
		}
		this.currTreeFrame=this.items[index];
		this.items[index].show(p);
	}
});
ST.TreeFrame=ST.extend(ST.Component,{
	eltag:"div",	
	initComponent: function(){
		ST.TreeFrame.superClass.initComponent.call(this);
	},
	onRender : function(ct, position) {
		ST.TreeFrame.superClass.onRender.call(this, ct, position);
		this.el.className="content-item clearfix";
		this.el.innerHTML=["<div class='main-left'>",
								"<div class='main-left-div'>",
									"<div class='box left-nav'>",			
										"<h1 class='box-title'><span class='tx'>",this.name,"</span></h1>",
										"<div class='box-body'>",
											"<div id='st-TreeFrame-",this.id,"' style='height:200px;'></div>",
										"</div>",
									"</div>",
								"</div>",
							"</div>",
							"<div class='main-right'>",
								"<div style='overflow:hidden;'>",		
									"<iframe width='100%' id='st-treeframe-frame-",this.id,"' src='' http://java:8080/swj/Models/UI/example/queryCRUD.html height='400px' frameborder=0 ></iframe> ",
								"</div>",
							"</div>"
		               ].join("");
		if(this.treeNode){
			this.FT=new ST.tree.Tree({
				height:this.height||400,
				//width:200,
				isExpandAll:this.isExpandAll||false,
				renderTo:'st-TreeFrame-'+this.id,
				data : this.treeNode,
				overHTML:"<div class='over-bg'><div class='over-left-bg'><div class='over-right-bg'></div></div></div>",
				selectedHTML:"<div class='selected-bg'><div class='selected-left-bg'><div class='selected-right-bg'></div></div></div>",
				selectedColor:"#fdf2a2",
				overColor:"#D9E8FB"
			});
			this.frame=$("st-treeframe-frame-"+this.id);
			this.FT.on("nodeClick",this.onTreeNodeClick,this);
		}
		
	},
	onTreeNodeClick:function(node,data,tree){
		this.fireEvent("treeClick",node,data,tree,this);		
	},
	show:function(p){
		this.el.style.display="";
		//this.el.style.zoom = 1;
		if(p){
			this.FT.select(p)
		}
		
	},
	hide:function(){
		this.el.style.display="none";
	}
});

ST.Types = {
	"tabnav" : ST.TabNav,
	"navnode" : ST.NavNode,
	"treeframe": ST.TreeFrame
};