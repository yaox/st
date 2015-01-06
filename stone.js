/**
 * @yao 2012-09-08
 */
try{document.execCommand("BackgroundImageCache", false, true);}catch(e){};
window["undefined"] = window["undefined"];
/**
 * ST核心类
 * @class ST  
 */
var ST={version:"0.0.1"};

(function(){
	var idkey=0;
	ST.Id=function(){
		idkey++;
		return "st-id-"+idkey;
	};
	/**
	 * 数组变量类型检查方法
	 * @method isArray
	 */
	ST.isArray=function(v){
		return Object.prototype.toString.call(v) === '[object Array]';   
	}
	/**
	 * 字符串变量类型检查方法
	 * @method isArray
	 */
	ST.isString= function(v){
       return typeof v === 'string';
	}
	ST.template =function(ts, o) {
		for (var p in o) {
			ts = ts.replaceAll("{" + p + "}", o[p]);
		}
		return ts;
	}
	ST.logOn=true;
	ST.log=function(msg){
		if(ST.logOn){
			ST.log=function(msg){
				if(typeof(console)=='undefined')return;
				if(typeof(msg)=="string"){
					console.log(new Date+":\r\n"+msg);		
				}
			}
			ST.log(msg)
		}
		
	}
	/**
	 * @method replaceAll
	 * @for String
	 */
	String.prototype.replaceAll = function(s1, s2) {
		return this.split(s1).join(s2);
	};
	/**
	 * 取得浏览器html文档可见区域大小
	 * @static 
	 * @method screenSize
	 */
	ST.screenSize=function(){
		var winWidth=0;
		var winHeight=0;
		//获取窗口宽度
		if (window.innerWidth)
			winWidth = window.innerWidth;
		else if ((document.body) && (document.body.clientWidth))
			winWidth = document.body.clientWidth;
	
		//获取窗口高度
		if (window.innerHeight)
			winHeight = window.innerHeight;
		else if ((document.body) && (document.body.clientHeight))
			winHeight = document.body.clientHeight;
		/*
		//通过深入Document内部对body进行检测，获取窗口大小
		if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
		{
			winHeight = document.documentElement.clientHeight;
			winWidth = document.documentElement.clientWidth;
		}*/
		return {h:winHeight,w:winWidth};
	};
	
	ST.namespace=function(name){
		var root = window;
		var parts=name.split(".");
        for (var i = 0, subLn = parts.length; i < subLn; i++) {
            part = parts[i];
            if (!root[part]) {
                root[part] = {};
            }
            root = root[part];
        }
	    return root;
	}
	
})();

/**
 * 拷贝Ext的Ext.apply方法
 * @method ST.apply
 * @param {} o
 * @param {} c
 * @param {} defaults
 * @return {}
 */
ST.apply = function(o, c, defaults){
	// no "this" reference for friendly out of scope calls
	if(defaults){
		ST.apply(o, defaults);
	}
	if(o && c && typeof c == 'object'){
		for(var p in c){
			o[p] = c[p];
		}
	}
	return o;
};

/**
 * ST实现继承的方法
 * @method ST.extend
 * @param {} subClass
 * @param {} superClass
 * @return {}
 */
ST.extend=function(subClass,superClass){
	var temp =null;
	if(typeof superClass == 'object'){//superClass为｛｝格式 
		temp = superClass;
		superClass = subClass;
		
		//如果superClass定义有constructor 且不等于Object的prototype.constructor
		subClass = temp.constructor != Object.prototype.constructor ? temp.constructor : function(){superClass.apply(this,arguments)}
	}
	//开始继承
	var F=function(){};
	F.prototype=superClass.prototype;
	
	subClass.prototype=new F();
	subClass.prototype.constructor=subClass;
	subClass.superClass=superClass.prototype;
	
	if(superClass.prototype.constructor==Object.prototype.constructor){
		superClass.prototype.constructor=superClass
	}
	//覆盖方法,属性
	if(temp)
		ST.apply(subClass.prototype,temp);
	return subClass;
};

/**
 * ST的事件类
 * @class ST.Event
 * @param {} obj
 * @param {} name
 */
ST.Event=function(obj,name){
	this.name=name;
	this.obj=obj;
	this.listeners=[];
};

ST.apply(ST.Event.prototype,{
	addListener : function(fn, scope){		
		var l={
			fn : fn,
			scope : scope||this.obj
		}
		if(!this.isListenered(fn, scope)){
			this.listeners.push(l);
		}
	},
	removeListener : function(fn, scope){
		var index=this.findListener(fn, scope || this.obj);
		if(index!=-1){
			this.listeners.splice(index,1);
			return true;
		}
		return false;
	},    
	findListener : function(fn, scope){
        var list = this.listeners,
            i = list.length,
            l;
        scope = scope || this.obj;
        while(i--){
            l = list[i];
            if(l){
                if(l.fn == fn && l.scope == scope){
                    return i;
                }
            }
        }
        return -1;
    },
    isListenered:function(fn, scope){
    	return this.findListener(fn, scope)!=-1;
    },
    fire : function(){
    	var len=this.listeners.length,
    		args= Array.prototype.slice.call(arguments, 0);
    	for(var i=0;i<len;i++){
    		var l=this.listeners[i];
    		if(l&&l.fn.apply(l.scope || this.obj || window, args)===false){
    			return false;
    		}
    	}    	
    	return true;
    }
});

ST.getPath=function(){
	var str=window.location.href;		
	var host=window.location.host;
	var temp=str.split(host);
	var arr=temp[1].split("/");
	arr.length=2;
	temp[1]=arr.join("/");		
	return temp.join(host);
};
/**
 * ST观察者模式实现类
 * @class ST.Observable
 */
ST.Observable=function(){
	var e=this.events;	
	this.events={};
	if(e&&ST.isArray(e)){
		
		for(var i=0;i<e.length;i++){			
			this.on(e[i].name,e[i].fn,e[i].scope)
		}
	}
	//alert(this.listeners.lenght)
	//this.events=e||{};
	
};
ST.apply(ST.Observable.prototype,{
	fireEvent:function(){
		var a= Array.prototype.slice.call(arguments, 0),
			ename=a[0].toLowerCase(),
			e=this.events[ename];
		a.shift();
		if(e)
			return e.fire.apply(e,a);		
		return false;
	},
	addListener:function(eventName, fn, scope){
		eventName = eventName.toLowerCase();
		var e = this.events[eventName];
		if(!e){
			this.events[eventName] = e = new ST.Event(this,eventName);
		}
		e.addListener(fn, scope);
	},
	removeListener:function(eventName, fn, scope){
		var e=this.events[eventName];
		if(typeof ce == 'object')
			e.removeListener(fn, scope);
	},
	on : function(){
		this.addListener.apply(this, arguments);
	}
});
ST.cache={};
/**
 * 组件类
 * @class ST.Component
 * @param {} config
 */
ST.Component=function(config){
	this.rendered=false;
	ST.apply(this,config);	
	if(!this.id){
		this.id=ST.Id();
	}
	ST.Component.superClass.constructor.call(this)	
	this.initComponent();
	ST.cache[this.id]=this;
	if(this.renderTo){
		this.render(this.renderTo);
		delete this.renderTo;
	}
};
ST.Component.prototype.lazyRender=false;
ST.Component.prototype.eltag='div';
ST.extend(ST.Component,ST.Observable);
ST.Component.prototype.initComponent=function(){};

ST.Component.prototype.render=function(ct,position){
	if(!this.rendered){
		this.rendered=true;
		this.ct=ct;
		this.onRender(this.ct,position);	
		this.afterRender(this.ct);
	}
};

ST.Component.prototype.onRender=function(ct,position){
	if(ST.isString(this.ct)){
		this.el=$(ct);
	}else{
		if(!this.el){
			this.el=document.createElement(this.eltag);
			this.el.id=this.id;
		}		
		if(this.el){
			if(this.ct.bodys){
				this.ct.bodys[position].appendChild(this.el);
				this.el.innerHTML="&nbsp;loading...";
			}else if(this.ct.body){
				this.ct.body.appendChild(this.el);
			}else{
				this.ct.appendChild(this.el);
			}
		}
	}
	if(this.el){
		this.el.style.cssText="width:"+(this.width||"auto")+"px;height:auto!important;height:"+(this.height||"auto")+"px !important;min-height:"+(this.height||"auto")+"px;"
	}

}
ST.Component.prototype.afterRender=function(ct){
	this.setSize(this.width,this.height);
}

ST.Component.prototype.setSize=function(width,height){
	//todo setSize
	this.onResize();
}
ST.Component.prototype.onResize=function(){};//空方法



ST.Container = ST.extend(ST.Component, {
	lazyRender:true,
	initComponent : function() {
		ST.Container.superClass.initComponent.call(this);
		// 初始化子组件
		var items = this.items;
		if (items) {
			delete this.items;
			this.add(items);
		}
	},
	initItems : function() {
		if (!this.items) {
			this.items = [];
		}
	},
	add : function(comp) {
		this.initItems();
		if (ST.isArray(comp)) {
			var i, len = comp.length;
			for (i = 0; i < len; i++) {
				this.items.push(new ST.Types[comp[i].type](comp[i]))
			}
		}		
	},
	onRender : function(ct, position) {
		ST.Container.superClass.onRender.call(this, ct, position);
		this.renderBody();
		if (this.layout) {
			var layout = new ST.LayoutType[this.layout](this,
					this.items, this.bodys);
			layout.doLayout();
			return;
		}
		
		if(this.items&&!this.lazyRender){
			var i, len = this.items.length;
			for(i=0;i<len;i++){
				this.items[i].render(this,i);
			}
		}
	},
	renderBody:function(){}
});

