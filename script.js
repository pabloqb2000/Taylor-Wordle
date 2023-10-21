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
        $('.letter-row').append('<div class="letter"></div>');        
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

function del() {
    getCurrentLetter().text('');
}

function delAll() {
    toggleLetterSelected();
    for (let i = 0; i < n; i++) {
        col = i;
        getCurrentLetter().text('');
    }
    col = 0;
    toggleLetterSelected();
}

function check() {
    toggleLetterSelected();
    
    let userWord = '';
    for (let i = 0; i < n; i++) {
        col = i;
        let letter = getCurrentLetter();
        userWord += letter.text();
    }

    if (userWord.length != word.length) {
        alert('Not all letters contain a value');
        return;
    }

    if (!(userWord in lyrics)) {
        alert("Taylor never said " + userWord);
        return;
    }

    $('.row.last').append('<div class="row text-align-center">' + 
        lyrics[userWord]['Lyric'] + "\nSong: " + lyrics[userWord]["Song"] + "\nAlbum: " + lyrics[userWord]["Album"]
    + '</div>');
    
    let allCorrect = true;
    for (let i = 0; i < n; i++) {
        col = i;
        let letter = getCurrentLetter();
        allCorrect &= letter.text() == word[i];

        if(letter.text() == word[i]) {
            letter.toggleClass('correct');
        } else if (word.includes(letter.text())) {
            letter.toggleClass('contained');
        } else {
            letter.toggleClass('none');
        }
    }

    if (allCorrect) {
        $('.keyboard').remove();
        alert("Congratulations\nTaylor said " + word + " in: " + titles[word].join(', '));
        return;
    }
    if(row == 4) {
        $('.keyboard').remove();
        alert("NOOO, the solution was: " + word + "\nBetter luck next time!");
        return;
    }

    row++;
    col = 0;
    toggleLetterSelected();
}
