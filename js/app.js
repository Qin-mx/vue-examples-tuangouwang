/**
 * 定义模版工具的方法
 */
var Util = {
	/**
	 * 通过id获取模版内容
	 * @inheritDoc script模版标签id
	 * @return {[type]} [description]
	 */
	tpl: function(id){
		// 同id获取模版内容
		return document.getElementById(id).innerHTML;
	},
	/**
	 * 异步请求方法
	 * @url   请求地址
	 * @fn 	  请求成功回调函数
	 */
	ajax: function(url,fn){
		//定义不创建xhr对象
		var xhr = new XMLHttpRequest();
		//事件
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if(xhr.status === 200){
					// console.log(xhr)
					// 将获取的数据传给fn
					//先将数据转化成json格式
					var data = JSON.parse(xhr.responseText);
					fn && fn(data);
					// console.log(xhr.responseText)
				}
			}
		}
		//打开接口
		xhr.open('GET',url,true)
		//send
		xhr.send(null);
	}
}
Util.ajax('data/home.json',function ( data ) {
	// console.log(data)
})

// 首先先定义组件
// 首页组件
var HomComponent = Vue.extend({
	// template:'home'
	props: ['dsearch'],
	template:Util.tpl('tpl_home'),
	data: function () {
		return {
			types:[
				{id: 1, title: '美食', url: '01.png'},
				{id: 2, title: '电影', url: '02.png'},
				{id: 3, title: '休闲娱乐', url: '03.png'},
				{id: 4, title: '外卖', url: '04.png'},
				{id: 5, title: 'ktv', url: '05.png'},
				{id: 6, title: '周边游', url: '06.png'},
				{id: 7, title: '丽人', url: '07.png'},
				{id: 8, title: '小吃快餐', url: '08.png'},
				{id: 9, title: '火车票', url: '09.png'},
				{id: 10, title: '酒店', url: '10.png'}
			],
			ad: [],
			list: [],
		}
	},
		//异步数据通过creaetd来获取
		//组件渲染完成以后调用回调函数
		created: function () { 
			var me = this;
			this.$parent.showSerch = true;
			Util.ajax('data/home.json',function (res) {
				// console.log(arguments,me.res)
				// 将数据保存在data中去
				if( res && res.errno === 0){
					//存储数据
					// 第一种
					// me.ad = res.data.ad;
					// me.list = res.data.list;
					// 第二种  (必须在data中定义好)
					me.$set('ad' , res.data.ad);
					me.$set('list' , res.data.list);
					// console.log(me)
				}
			});

			
		}
	})
// 列表组件
var ListComponent =Vue.extend({
	props: ['dsearch'],
	template: Util.tpl('tpl_list'),
	data: function () {
		return {
			types:[
				{value: '价格排序', key: 'price'},
				{value: '销量排序', key: 'sales'},
				{value: '好评排序', key: 'evaluate'},
				{value: '优惠排序', key: 'discount'},
			],
			list: [],
			// 剩下的数据
			other: [],
		}
	},
	created: function () {
		var me = this;
		this.$parent.showSerch = true;
		// 获取伏组件的query字段，拼接url
		var query = me.$parent.query;
		// 保留query字段
		var str = '?';
		if( query[0] && query[1]){
			str += query[0] +'='+ query[1]
		}
		Util.ajax('data/list.json' + str,function (res) {
			if( res && res.errno === 0 ){
				// 只保留前三条
				me.$set('list',res.data.slice(0,3))
				// 其他数据
				me.$set('other',res.data.slice(3))
				// console.log(me)
			}
		})
	},
	// 定义事件
	methods: {
		loadMore: function (e) {
			// 现将other的数据添加到list中
			this.list = this.list.concat(this.other)
			this.other = []
		},
		sortBy: function (type){
			// type就是传入的值
			// 判断优惠价格
			if ( type === 'discount'){
				// 优惠价格计算
				this.list.sort( function (a, b) {
					var ap = a.orignPrice-a.price;
					var bp =b.orignPrice-b.price;
					// 排序
					return   bp - ap
				})
			}else{
				this.list.sort(function(a,b){
				// 反序
				return b[type] - a[type]
			})
			}
			
		}
	}
})
// 商品页组件
var ProductComponent =Vue.extend({
	props: ['dsearch'],
	template: Util.tpl('tpl_product'),
	data:function () {
		return {
			data: {
				src:'01.jpg'
			}
		}
	},
	created: function (){
		// 请求数据接口
		var me = this;
		// 隐藏input
		this.$parent.showSerch = false;
		Util.ajax('data/product.json',function(res){
			if( res && res.errno === 0){
				me.data = res.data;
				// console.log(me)
			} 
		})
	}
})
// 注册组件
// 注册首页组件
Vue.component('home',HomComponent);
// 注册列表页组件
Vue.component('list',ListComponent);
// 注册商品页组件
Vue.component('product',ProductComponent);

//定义价格过滤器
Vue.filter('price',function (str) {
	return str + '元';
})
Vue.filter('orignPrice',function (str) {
	return '门市价:' + str + '元';
})
Vue.filter('sales',function (str) {
	return '已售' + str;
})
// 实例化对象
var app = new Vue({
	el:'#app',
	data:{
		view:'',
		query: [],
		search: '',
		showSerch: true,
	},
})



// 路由函数
function router () {
	// 处理hash业务逻辑
	// 获去hash值，根据不同的值渲染页面
	// 当hash为空，始终设置默认值
	var str  = location.hash;
	//获取#/和/之后的字符串
	// 去掉#;
	str = str.slice(1);
	//处理第一个/也就是#//
	str = str.replace(/^\//,'')
	//获取/后的字符串
	// if(str.indexOf('/') > -1){
	// 	// 截取str到/的字符
	// 	str = str.slice(0,str.indexOf('/'))
	// }
	str = str.split('/')
	// 映射列表
	var map ={
		home:true,
		list:true,
		product:true
	}
	// 判断str是否在map中，如果在就渲染，不再就渲染home页面
	if(map[str[0]]){
		//渲染那个页面就将app.view设置
		app.view = str[0];
	}else{
		app.view = 'home';
	}
	// console.log(str)
	// 将['type','1']保留下来
	app.query = str.slice(1);
}

// 页面加载时触发load事件，然后根据hash来判断进入页面
window.addEventListener('load',router);
// hash改变事件叫hashchange
window.addEventListener('hashchange',router);