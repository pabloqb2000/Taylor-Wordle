let lyrics;
let titles;
let word = "WALLS";
let n = word.length;
let col = 0;
let row = 0;

var randomProperty = function (object) {
    var keys = Object.keys(object);
    return keys[Math.floor(keys.length * Math.random())];
};
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

$(document).ready(function(){
    prepareData();
});

function prepareData() {
    $.getJSON("lyrics.json", function(lyricsJson) {
        $.getJSON("titles.json", function(titlesJson) {
            lyrics = lyricsJson;
            titles = titlesJson;
            word = randomProperty(titlesJson);
            console.log(word)
            n = word.length;

            spawnLetters();
            addEvents();
            toggleLetterSelected();
        })
    });
}

function spawnLetters() {
    for (let i = 0; i < n; i++) {
        $('.letter-row').each((j,e) => e.innerHTML +=
            '<div class="letter" onclick="pressedLetter(this)" data-column=' + i + ' data-row=' + j + '></div>');
    }
}

function addEvents() {
    $('.key-l').on('click', function(e) {
        e.preventDefault();
        pressedKey(this.innerText);
    });
}

function colNext() {
    toggleLetterSelected();
    col = (col + 1) % n;
    toggleLetterSelected();
}
function colLast() {
    toggleLetterSelected();
    col = (col - 1) % n;
    if(col < 0) col += n;
    toggleLetterSelected();
}

function getCurrentLetter() {
    return $('.letter-row').eq(row).children().eq(col);
}

function toggleLetterSelected() {
    getCurrentLetter().toggleClass('selected');
}

function pressedKey(key) {
    getCurrentLetter().text(key);
    colNext();
}

function pressedLetter(letter) {
    const clickedRow = letter.dataset.row; 
    if (clickedRow == row) {
        toggleLetterSelected();
        col = parseInt(letter.dataset.column);
        toggleLetterSelected();
    } else if (clickedRow >= 0 && clickedRow < row) {
        const currentRow = row;
        const currentCol = col;
        row = clickedRow;

        let rowWord = '';
        let html = '';
        for (let i = 0; i < n; i++) {
            col = i;
            let letter = getCurrentLetter();
            rowWord += letter.text();
            html += '<div class="l ' + letter.attr('class') + '">' + letter.text() + "</div>";
        }

        $("#word-toast .toast-header strong").html(html);
        $("#word-toast .toast-body").html(
            "Lyric: <i>&ldquo;" + lyrics[rowWord]["Lyric"] + 
            "&rdquo;</i><br>Song: " + lyrics[rowWord]["Song"] + 
            "<br>Album: " + lyrics[rowWord]["Albumx"]);
        $("#word-toast").toast('show');

        col = currentCol;
        row = currentRow;
    }
}

function del() {
    let letter = getCurrentLetter();
    if(letter.text() != '') {
        letter.text('');
    } else if(col > 0) {
        colLast();
        getCurrentLetter().text('');
    }
}

function check() {
    startCol = col;

    let userWord = '';
    for (let i = 0; i < n; i++) {
        col = i;
        let letter = getCurrentLetter();
        userWord += letter.text();
    }

    if (userWord.length != word.length) {
        const rowElem = $('.letter-row').eq(row);
        rowElem.children().each((i,e) => {
            $(e).removeClass("error"); 
            rowElem[0].removeChild(e);
            rowElem[0].appendChild(e);
            if(e.innerText == '')
                $(e).addClass("error"); 
        });
        col = startCol;
        return;
    }

    if (!(userWord in lyrics)) {
        showAlert("No Taylor song contains the word: " + userWord);
        col = startCol;
        return;
    }

    let wordTest = word;
    // Correct pass
    let allCorrect = true;
    for (let i = 0; i < n; i++) {
        col = i;
        let letter = getCurrentLetter();
        allCorrect &= letter.text() == word[i];

        if(letter.text() == word[i]) {
            letter.toggleClass('correct');
            wordTest = wordTest.replaceAt(i, "_");
        }
    }
    // Contained pass
    for (let i = 0; i < n; i++) {
        col = i;
        let letter = getCurrentLetter();
        
        if(letter.text() == word[i]) {
            continue;
        } else if (wordTest.includes(letter.text())) {
            letter.toggleClass('contained');
            wordTest = wordTest.replace(letter.text(), "_");
        } else {
            letter.toggleClass('none');
        }
    }

    col = startCol;
    toggleLetterSelected();
    if (allCorrect) {
        const myModalAlternative = new bootstrap.Modal('#wonModal');
        myModalAlternative.show();
        $('#wonModal strong.modal-word').text(word);
        $('#wonModal p.modal-text')[0].innerHTML += titles[word].join('<br>');
        $('.keyboard').remove();                
        $('.last').append('<div class="row justify-content-center">' +
           'Word: ' + word + "<br>Songs:<br>" + titles[word].join('<br>')
        + '</div>');
        row=-1;
        return;
    }
    if(row == 4) {
        const myModalAlternative = new bootstrap.Modal('#lostModal');
        myModalAlternative.show();
        $('#lostModal strong.modal-word').text(word);
        $('#lostModal p.modal-text')[0].innerHTML += titles[word].join('<br>');
        $('.keyboard').remove();                 
        $('.last').append('<div class="row justify-content-center">' +
        'Word: ' + word + "<br>Songs:<br>" + titles[word].join('<br>')
        + '</div>');  
        row=-1;
        return;
    }

    row++;
    col = 0;
    toggleLetterSelected();
}

function showAlert(msg) {
    const domAlert = document.getElementById("alert");

    if(domAlert) {
        $("#alert-msg").text(msg);
    } else {
        $('h1').after(
            '<div class="alert alert-warning alert-dismissible fade show" id="alert" role="alert">' +
                '<div class="d-flex justify-content-center"><i class="bi bi-exclamation-diamond-fill"></i><div id="alert-msg"style="margin-left:8px;">' + msg + "</div></div>" +
                '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'+
            '</div>')[0];
    }
}
