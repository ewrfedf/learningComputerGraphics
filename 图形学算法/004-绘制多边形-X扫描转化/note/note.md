> 代码基于Three.js
> 参考:
【1】计算机图形学基础教程(第一版)-课件
【2】中国大学MOOC 中国农业大学 计算机图形学课程
【3】[多边形扫描算法](https://www.cnblogs.com/keguniang/p/
9672098.html)
【4】[X-扫描算法代码](https://github.com/fuWenMr/computeGraphicsTry)



# 多边形的扫描转换
前面讲的都是绘制直线,接下来的目标就是如何绘制2d的多边形。

把多边形的顶点表示转换为点阵表示。这种转换称为**多边形的扫描转换**。

## 1、基础知识
多边形有两种重要的表示方法：**顶点表示**和**点阵表示**。
<img src="01.png">

**1)** 顶点表示:是用多边形的顶点序列来表示多边形
- 优点: 这种表示直观、几何意义强。占内存少，易于进行几何变换。
- 缺点：没有明确指出哪些像素在多边形内，故不能直接用于面着色。

**2)** 点阵表示：用位于多边形内的像素集合来刻画多边形
- 优点：是光栅显示系统显示时所需的表现形式
- 缺点：丢失了许多几何信息（如边界，顶点等）

多边形分类：
- 凸多边形：任意两点的连线均在多边形内
- 凹多边形：两顶点的连线有可能不在多边形内
- 含内环的多边形：多边形内包含多边形

<img src="02.png">

## 2、X-扫描线算法
按扫描线顺序，计算扫描线与多边形的相交区间，再用要求的颜色显示这些区间的象素，即完成填充工作。
<img src="03.png">



**算法步骤:**
<img src="04.png">
(1) 确定多边形所占有的最大扫描线数，得到多边形顶点的最小和最大y值（ymin和ymax）

(2)从y = ymin到y = ymax，每次用一条扫描线进行填充

(3) 对一条扫描线填充的过 程可分为四个步骤：
- a、求交：计算扫描线与多边形各边的交点
- b、排序：把所有交点按递增顺序进行排序(**按交点x值递增排序，才能确保交点两两配对时填充区间的正确性。**)
- c、交点配对：确定填充区间, 第一个与第二个，第三个与第四个
- d、区间填色：把这些相交区间内的像素置成不同于背景色的填充色

**交点的数量：**
- 检查共享顶点的两条边的另外两个端点的y值，按这两 个y值中大于交点y值的个数来决定交点数

**交点的取舍:**
当扫描线与多边形顶点相交时,交点的个数应保证为偶数个。取舍判断条件:
- 顶点的两条边的另外两个端点的y值。按这两个y值中大于交点y值的个数是0,1,2来决定。

<img src="05.png">

拿交点①来说,顶点②和顶点④的y值都小于交点①的y值,所以①的交点数量等于0。


**存在的问题：**
- 为了计算每条扫描线与多边形各边的交点，最简单的方法是把多边形的所有边放在一个表中。在处理每条扫描线时，按顺序从表中取出所有的边，分别与扫描线求交。
- 这个算法效率低，因为求交的计算量是非常大。

## 3、X-扫描线算法的改进
### 1.三方面的改进
- a. 处理一条扫描线，仅对与它相交的多边形的边（有效边）进行求交运算。（也就是避免把所有的边都进行求交，因为大部分的边求交结果为空。所以设置一个表来记录有效边。即下面提到的AET）

- b. 考虑边的连贯性：当前扫描线与各边的交点顺序与下一条扫描线与各边的交点顺序很可能相同或非常相似。

- c. 多边形的连贯性：当某条边与当前扫描线相交时，它很可能也与下一条扫描线相交。

### 2.数据结构
通过引入新的数据结构来避免求交运算。

**(1)活性边表**
- a.  活性边表(**AET**): 把和当前扫描线相交的边称为活性边，并把它们按交点x坐标递增的顺序存于一个链表中。

- b.  结点内容
<img src="06.png">
  - x: 当前扫描线与边的交点坐标
  - ymax: 该边所交的最高扫描线的坐标值,是为了知道何时达到边界
  - next: 指向下一条边的指针
  - Δx=1/k，从当前扫描线到下一条扫描线间x的增量,扫描线与多边形的交点和上一次交点相关:
  <img src="11.png">
  设边的直线斜率为k:
  $$
  k = \frac {\Delta y}{\Delta x} = \frac {y_{i+1}-y_i}{x_{i+1}-x_i}
  $$
  y每次加一:
  $$
  x_{i+1} - x_i = \frac{1}{k} \\
  x_{i+1}  = \frac{1}{k} +x_i
  $$

- c. 举例
<img src="07.png">

**(2)新边表(NET)**
建立AET需要知道与哪些边相交，所以定义NET来存储边的信息，从而方便AET的建立。

- a.  构造一个纵向链表，长度为多边形占有的最大扫描线数。每个节点（称为吊桶）对应多边形覆盖的一条扫描线。

- b.  结点内容
<img src="08.png">
  ymax：该边的y最大值
  xmin：该边较低点的x坐标
  1/k：该边的斜率

- c. NET挂在与该边较低端y值相同的扫描线吊桶中
<img src="09.png">
<img src="12.png">


- d) 每做一次新的扫描时，要对已有的边进行三个处理：
  - 1.是否被去除掉；
  - 2.若不被去除掉，就要对它的数据进行更新，x=x+1/k；
  - 3.是否有新的边进来，新的边在NET里，可以插入排序插进来。

**(3)NET与AET的使用流程**
首先我们得明白，AET的目的是为了使用增量方法避免求交运算，而NET是用在构造AET的。
- a.  所以第一步为构造NET。
  方法：遍历所有扫描线，把ymin = i 的边放进NET[ i ]中，从而构造出整个NET。

- b.  然后构造AET。
  方法：循环取出扫描线，直接将此扫描线在NET中的边结点插入到AET中。此时AET就存储了哪些边是有效边了。

  **注意**: 我们来回看2个表里的结点可发现，NET里的1/k、xmin、ymax正好对应AET里的Δx、x、ymax。这也是能用NET构造AET的原因。

- c. 区间填色。
  方法：取第一条扫描线，在配对点区间中填色。当扫描线达到ymax时，舍弃此边结点。否则使用增量方法得到下一个配对结点的x坐标。取下一条扫描线，重复c操作。

```js
那么到底是如何实现避免求交的？

答：
1) 第一个交点的x坐标是NET中传到AET的，也就是最低端的点,此点先渲染。
2) 然后根据两条边的斜率来进行增量方法得到下一对配对交点的x坐标，
   取下一条扫描线时,根据x坐标和扫描线y值可得交点的具体坐标，
   从而用增量方法代替了求交运算。
3) 要注意的是：只要扫描线<ymax, 那么它对应的NET都是相同的，
   因为NET挂在与该边较低端y值相同的扫描线吊桶中。
```

**(4)伪代码:**
<img src="10.png">



<全文结束>

## 3、代码实现
```js
/**
 * 感谢: https://github.com/fuWenMr/computeGraphicsTry
 */

// 新边表节点,存放所有边的信息
class NetNode {
  constructor(obj) {
    let { p1, p2, k, maxY, minY, minX, dx } = obj
    this.p1 = p1
    this.p2 = p2
    this.k = k
    this.maxY = maxY
    this.minY = minY
    this.minX = minX // xmin
    this.dx = dx
  }
}

// 活性表节点
class AetNode {
  constructor(obj) {
    let { x, dx, maxY, next } = obj
    this.x = x
    this.dx = dx
    this.maxY = maxY
    this.next = next
  }
}

function deepCopy(obj) {
  var result = Array.isArray(obj) ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = deepCopy(obj[key]);   //递归复制
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

// 直线扫描算法
export class ScanLine {
  /**
   *
   * @param {*} polyPoints 多边形用顶点描述
   */
  polyfill(polyPoints = []) {
    // 存放多边形点阵形式的坐标
    let res = []

    // 获得扫描线的范围
    let maxY = 0;
    let minY = 1 / 0;
    polyPoints.forEach(point => {
      maxY = point.y > maxY ? point.y : maxY;
      minY = point.y < minY ? point.y : minY;
    });

    // 建立新边表 neT, 存放所有边的信息
    const neT = this.getLinesByPoints(polyPoints)

    // 建立活性边表的第一条数据y=minY 放入 aeT
    let currentY = minY
    let currentIndex = 0;
    let aeT = {
      next: null
    }
    let ae = aeT
    while (neT[currentIndex] && neT[currentIndex].minY == currentY) {
      let { minX, dx, maxY } = neT[currentIndex];
      ae.next = new AetNode({ x: minX, dx, maxY, next: null })
      ae = ae.next;
      currentIndex++;
    }
    // console.error("net", deepCopy(neT));
    // console.error("aet", deepCopy(aeT));

    // 开始扫描转换, minY ~ maxY
    for (; currentY <= maxY; currentY++) {
      //交点数组
      let activeXs = [];
      let aeLast = aeT;

      do {
        ae = aeLast.next;
        // console.error("in-aeLast", currentY, deepCopy(aeLast));
        // console.error("in-ae", currentY, deepCopy(ae));

        activeXs.push(ae.x);
        ae.x += ae.dx;
        // 结束边
        if (ae.maxY == currentY) {
          aeLast.next = ae.next;
        }
        else {
          aeLast = ae;
        }
        // console.error("out-aeLast", currentY, deepCopy(aeLast));
        // console.error("out-ae", currentY, deepCopy(ae));
      }
      while (ae.next)

      // 得到所有的x
      activeXs = this.xHandler(activeXs);

      for (let i = 0; i < activeXs.length; i += 2) {
        res = res.concat(this.getAllPointsByX(activeXs[i], activeXs[i + 1], currentY));
      }
      // 到达新边

      while (neT[currentIndex] && neT[currentIndex].minY == currentY) {
        let { minX, dx, maxY } = neT[currentIndex];
        aeLast.next = new AetNode({ x: minX, dx, maxY, next: null })
        aeLast = aeLast.next;
        currentIndex++;
      }
    }

    return res
  }

  /**
    * 将传入的几个点转化为带斜率边
    * @param  {...any} points
    */
  getLinesByPoints(points) {
    let res = [];
    let firstPoint = points.shift();
    let p1 = firstPoint
    let p2
    for (let i in points) {
      p2 = points[i];
      res.push({ p1, p2, k: (p2.y - p1.y) / (p2.x - p1.x) });
      p1 = p2;
    }
    p2 = firstPoint;
    res.push({ p1, p2, k: (p2.y - p1.y) / (p2.x - p1.x) });
    // console.error(res);

    res = this.sortLinesByY(res)
    return res;
  };

  /**
    * 将传入的几个点按照的先y再x的顺序排列
    * @param  {...any} points
    */
  sortLinesByY(lines) {
    lines.forEach(line => {
      var { p1, p2 } = line;
      if (p1.y > p2.y) { let temp = p2; p2 = p1; p1 = temp; }
      line.maxY = p2.y;
      line.minY = p1.y;
      line.minX = p1.x;
      line.dx = 1 / line.k;
    });

    // 数组将按照升序排列
    lines.sort((l1, l2) => {
      return l1.minY - l2.minY;
    });

    let retNew = []
    retNew = lines.map(line => {
      return new NetNode(line)
    });
    return retNew;
  };

  xHandler(xs) {
    xs.sort((a, b) => { return a - b; });
    if (xs.length == 1) { xs.push(xs[0]) };
    return xs;
  }

  getAllPointsByX(x1, x2, y) {
    var res = [], x = x1;
    for (; x <= x2; x++) {
      res.push(this.toP([x, y]));
    }

    return res;
  }

  toP(arr) {
    if (!Array.isArray(arr)) {
      let { x, y } = arr;
      return { x, y };
    }
    //对象化  取整数
    return { x: parseInt(arr[0] + 0.5), y: parseInt(arr[1] + 0.5) }
  }
}
```
<img src="13.png">

<全文结束>
