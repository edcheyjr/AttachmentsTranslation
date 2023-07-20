// global variables
const paragraphs = document.getElementsByTagName('p');
const key = 'CchUDZnRgjptX25sM8zP';
const apiId = '20220208001077065';
// const all translation from english
const translation = ['zh', 'jp', 'kor', 'fra', 'ru', 'de', 'en'];
const languages = [
  'Chinese',
  'Japanese',
  'Korean',
  'French',
  'Russian',
  'Deutsch',
  'English',
];

var translationData = {
  src: null,
  dst: null,
  from: null,
  to: null,
};
(function () {
  /*变量定义部分*/
  var type = document.getElementsByClassName('lang-panel')[0].children;
  var result = document.getElementsByClassName('result')[0];
  var input = document.getElementsByClassName('input')[0],
    output = document.getElementsByClassName('output')[0];
  var transBtn = document.getElementsByClassName('transbtn')[0],
    clear = document.getElementsByClassName('clear')[0];
  var htimer = null;

  var lang = 'en',
    timer = null,
    len = type.length;

  function createScript(src) {
    var script = document.createElement('script');

    script.id = 'urlData';
    script.src = src;

    document.body.appendChild(script);
  }

  function changeType() {
    lang = this.getAttribute('data-type');

    result.innerHTML = this.innerHTML;
  }
  function translate() {
    var value = 'http://api.fanyi.baidu.com/api/trans/vip/translate?';

    var date = Date.now();

    var str = apiId + input.value + date + key;

    var md5 = MD5(str);

    var data =
      'q=' +
      input.value +
      '&from=auto&to=' +
      lang +
      '&appid=20220208001077065' +
      '&salt=' +
      date +
      '&sign=' +
      md5 +
      '&callback=callbackName';
    //引入src路径
    var src = value + data;

    createScript(src);
  }
  function init() {
    //循环添加点击事件
    for (var i = 0; i < len; i++) {
      //点击时间就是改变语言类型
      type[i].onclick = changeType;
    }
    //清除按钮点击事件
    clear.onclick = function () {
      input.value = '';
    };
    //点击翻译

    transBtn.onclick = function () {
      //如果输入内容为空则返回
      if (input.value == '') {
        return;
      }
      //获取创建的script标签
      var s = document.getElementById('urlData');
      //如果script标签已经存在删除了重新创建
      if (s) {
        s.parentNode.removeChild(s);
        translate();
      } else {
        translate();
      }
    };
    //键盘按下事件
    output.onkeydown = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        if (input.value == '') {
          return;
        }

        var s = document.getElementById('urlData');
        if (s) {
          s.parentNode.removeChild(s);
          translate();
        } else {
          translate();
        }
      }, 500);
      clearTimeout(timer);
    };
  }

  function onHoverTranslate() {
    var last_hovered_word = null;

    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i].onmouseover = (e) => {
        // If whole paragraph is hovered, don't do anything
        if (e.target.nodeName == 'P') {
          // return;
        }

        // If user is still hovering within same word, ignore
        if (last_hovered_word == e.target.innerText) {
          return;
        }

        // Set the target text as the currently (last) hovered text
        last_hovered_word = e.target.innerText;

        // Replace the word with a span element with a tooltip
        if (lang != 'en') {
          e.target.innerHTML = e.target.innerText.replace(
            /(([\w])+)/g,
            `<span id="tooltip" class="tooltip" data-tooltip="Getting translation..." data-src="$&">$& </span>`
          );
        }

        // translate each word
        const current_span = e.target.querySelector('span');

        // Mark the span as last active, and deactivate other tooltip spans
        var active_tooltip = document.querySelector('.tooltip.active') || null;
        if (active_tooltip) {
          active_tooltip.classList.remove('active');
        }

        // Set the tooltip as the active one, for easy access in the callback
        current_span.classList.add('active');

        // Get the current word from the span
        let word = getEachWord(current_span);

        // The timer will allow us to translate words which the user hovered on for some time
        htimer = setTimeout(() => {
          // If the user moved to another word within the 500ms, we won't translate
          //
          if (last_hovered_word == e.target.innerText) {
            if (word !== null) {
              translateWord(word);
            }
          }
        }, 500);
      };
    }
  }

  /**
   *
   * @param {HTMLElement} element current element onHovered
   * @returns {string} return the string of that element
   */
  function getEachWord(element) {
    let string = element.textContent;
    return string;
  }

  function translateWord(str) {
    let date = Date.now();
    const data = apiId + str + date + key;
    const signCode = MD5(data);
    const q = `${str}&from=auto&to=${lang}&appid=20220208001077065&salt=${date}&sign=${signCode}&callback=hoveredTranslationCallback`;
    const URL = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${q}`;
    createScript(URL);
  }

  window.onload = function () {
    init();
    // on hover translate
    onHoverTranslate();
  };
})();

function callbackName(str) {
  console.log(str);

  var output = document.getElementsByClassName('output')[0];
  if (!str) {
    output.innerHTML = 'translating...';
  } else {
    if (str.trans_result) {
      output.innerHTML = str.trans_result[0].dst;
    } else {
      console.log(str.error_code + ':' + str.error_msg);
    }
  }
}

function hoveredTranslationCallback(str) {
  if (str) {
    if (!str.trans_result) {
      console.log(str.error_code + ':' + str.error_msg);
    } else {
      // Parse the translation data
      translationData.dst = str.trans_result[0].dst;
      translationData.src = str.trans_result[0].src;
      translationData.from = str.from;
      translationData.to = str.to;

      // Get the source and destination language
      var from_lang = languages[translation.indexOf(str.from)] || str.from;
      var to_lang = languages[translation.indexOf(str.to)] || str.to;

      // Format data to add to tooltip
      let formattedData = `${from_lang} => ${translationData.src}\t
      ${to_lang} => ${translationData.dst}`;

      // Get the active tooltip
      if (from_lang != to_lang) {
        const activeTooltip = document.querySelector('.tooltip.active');

        // Set the tooltip data to the formated data
        if (activeTooltip) {
          // This check ensures the translation for a particular word is only set to that words tooltip
          if (activeTooltip.dataset.src == translationData.src) {
            activeTooltip.dataset.tooltip = formattedData;
          }
        } else {
          console.log('Oops. A problem..');
        }
      }
    }
  }
}
