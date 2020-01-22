它是一个 webpack loader

.pen.ts 机制，凭借 pen-loader，webpack 将对 .pen.ts 文件特殊处理：

1. 如果 .pen.ts 是作为入口文件被系统调用，则替换该文件中所有 import xxx from 'xxxx.pen.js' 语句中的文件路径为 'xxxx.pen.js?exported_var_name_1,exported_var_name_2...'

```javascript
import {exportedText} from './article_b.pen.ts'
```

=> 

```javascript
import {exportedText} from './article_b.pen.ts?exportedText'
```

2. 如果是非系统调用，而是模块间调用，即 .ts 调用 .pen.ts 时，将不会直接返回整个 .pen.ts，而是返回它的子集：只和 exported_var_name 指定变量的值相关的代码部分，删去无关的代码

```javascript
// article_b.pen.ts
import a from ''
import others_import from ''

let b = 'b'
export let exportedText = [a, b, 'c']

function others_func(){
    a.push(1)
}
let others_var = '123'
```

=> 

```javascript
import a from ''
let b = 'b'
let exportedText = [a, b, 'c']
export {exportedText}
```


引入上述机制的原因是： 

JSpen 需要 js 的引用机制，来产生文章间的联系，但同时，若是常规情况，article1.js 引用了 article2.js 中的内容，将导致webpack打包时，将两篇文章的内容一起打包，从网页加载的角度来说这是不可容忍的。

所以 .pen.ts 之间的 import，得到的实际上都是 treeshaking 处理后的程序子集。