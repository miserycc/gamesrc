var w = [92, 4, 43, 83, 84, 68, 92, 82, 6, 44, 32, 18, 56, 83, 25, 96, 70, 48, 14, 58];//重量
var p = [44, 46, 90, 72, 91, 40, 75, 35, 8, 54, 78, 40, 77, 15, 61, 17, 75, 29, 75, 63];//价值
var maxWeight = 878;//背包最大重量,最优价值1024
// var w = [71,34,82,23,1,88,12,57,10,68,5,33,37,69,98,24,26,83,16,26,18,43,52,71,22,65,68,8,40,40,24,72,16,34,10,19,28,13,34,98,29,31,79,33,60,74,44,56,54,17];//重量
// var p = [26,59,30,19,66,85,94,8,3,44,5,1,41,82,76,1,12,81,73,32,74,54,62,41,19,10,65,53,56,53,70,66,58,22,72,33,96,88,68,45,44,61,78,78,6,66,11,59,83,48];//价值
// var maxWeight = 300;//背包最大重量，最优价值1063
var num = p.length;//物品数量
var ffnum = 10;//萤火虫数量
var maxAttract = 1.0;//最大吸引度
var gama = 0.5;//光强吸收系数
var alpha = 0.2;//步长因子
var maxIterations = 60;//最大迭代次数
//萤火虫对象
var Firefly = function(id) {
	this.id = id;
	this.position = Position();
	this.nextPostition = this.position;
	this.bright = Bright(this.position);
}
//萤火虫组
var Fireflies = function() {
	var fireflies = new Array([ffnum]);
	for (var i = 0; i < ffnum; i++) {
		fireflies[i] = new Firefly(i);
	}
	return fireflies;
}
//随机函数
var Rand = function() {
	var rand = Math.round(Math.random(0,1) * 100)/100;
	return rand;
}
//初始化萤火虫位置
var Position = function() {
	var x = new Array([num]);
	for(var i = 0; i < num; i++) {
		x[i] = Rand();
	}
	Discrete(x);
	return x;
}
//计算萤火虫亮度
var Bright = function(x) {
	x = Possible(x);
	var bright = 0;
	for(var i = 0; i < num; i++) {
		bright += x[i] * p[i];
	}
	return bright;
}
//计算两个萤火虫的距离
var Distance = function(ffX, ffY) {
	var x = ffX.position;
	var y = ffY.position;
	var temp = 0.0;
	for (var i = 0; i < num; i++) {
		temp += (x[i] - y[i]) * (x[i] - y[i]);
	}
	return Math.sqrt(temp);
}
//离散化
var Discrete = function(x) {
	for(var i = 0; i < num; i++) {
		if(x[i] > 0.5) {
			x[i] = 1;
		} else {
			x[i] = 0;
		}
	}
}
//多样化
var Diversify = function(ffs) {
	var ff = ffs[0];
	for (var i = 0; i < ffnum; i++) {
		if(ffs[i].bright < ff.bright) {
			ff = ffs[i];
		}
	}
	var x = ff.position;
	var index = 0;
	for (var i = 1; i < num; i++) {
		if(x[index] == 1) {
			index = i;
			continue;
		}
		if((x[i] != 1) && (p[i] / w[i] > p[index] / w[index])) {
			index = i;
		}
	}
	x[index] = 1;
	ff.bright = Bright(x);
}
//可行化
var Possible = function(x) {
	var weight = 0;
	for(var i = 0; i< num; i++) {
		weight += x[i] * w[i];
	}
	if(weight <= maxWeight) {
		return x;
	}
	var index = 0;
	for(var i = 1; i< num; i++) {
		if(x[index] == 0) {
			index = i;
			continue;
		}
		if((x[i] != 0) && (p[i] / w[i] < p[index] / w[index])) {
			index = i;
		}
	}
	x[index] = 0;
	return Possible(x);
}
//萤火虫移动
var Move = function(ffs) {
	for (var i = 0; i < ffnum; i++) {
		for (var j = 0; j < ffnum; j++) {
			if(j == n)continue;
			if(ffs[j].bright > ffs[i].bright) {
				var attract = maxAttract * Math.pow(Math.E, - gama * Math.pow(Distance(ffs[i], ffs[j]), 2));
				var x = ffs[i].position;
				var xt = ffs[i].nextPostition;
				var y = ffs[j].position;
				for(var n = 0; n < num; n++) {
					xt[n] = x[n] + attract * (y[n] - x[n]) + alpha * (Rand() - 0.5);
				}
			}
		}
	}
	for (var i = 0; i < ffnum; i++) {
		Discrete(ffs[i].nextPostition);
		ffs[i].position = ffs[i].nextPostition;
		ffs[i].bright = Bright(ffs[i].position);
	};
	Diversify(ffs);
}
//打印信息
var Print = function(ffs) {
	for (var i = 0; i < ffnum; i++) {
		console.log("[ "+ffs[i].position+" ] "+ffs[i].bright);
	};
	console.log("-------------------------------------------------")
}



// var ffs = new Fireflies();
// Print(ffs);
// for (var i = 0; i < maxIterations; i++) {
// 	Move(ffs);
// };
// Print(ffs);
