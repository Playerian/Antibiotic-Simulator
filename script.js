var fieldSize;
var antibiotics;
var antiMin;
var antiMax;
var field;
var $canvas = $("#canvas");
var canvas = $canvas.get(0);
var draw = canvas.getContext("2d");
var pixelSize = 8;
var color;
var bacteriaC = "yellow";
var mutantC = "red";
var bacx;
var bacy;
var timer;
var word = $("#word");
var speed;
var time = 0;
var $time = $("#time");
var mutateRate;
var conjRate;

//utility functions
function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function rgb(r, g, b){
    return ["rgb(",r,",",g,",",b,")"].join("");
}

function initialize(){
    word.text("Press Start to start.");
    clearInterval(timer);
    getInputs();
    //coloring
    var RGB = Math.floor(255 / (antiMax + 1));
    color = [];
    for (var i = 0; i < antiMax + 1; i ++){
        color.unshift(i * RGB);
    }
    canvas.width = fieldSize * pixelSize;
    canvas.height = fieldSize * pixelSize;
    field = [];
    field.length = fieldSize;
    for (var i = 0; i < fieldSize; i ++){
        field[i] = [];
        field[i].length = fieldSize;
    }
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            field[i][i2] = 0;
        }
    }
    for (var i = 0; i < antibiotics; i ++){
        var x = randomInt(0,fieldSize - 1);
        var y = randomInt(0,fieldSize - 1);
        field[x][y] = randomInt(antiMin,antiMax);
    }
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            if (field[i][i2] > 0){
                spread(i,i2);
            }
        }
    }
    bacSpawn();
    renderField();
}

function getInputs(){
    fieldSize = parseInt($("#fieldSize").val());
    if (fieldSize > 200){
        fieldSize = 200;
    }
    antibiotics = parseInt($("#antibiotics").val());
    antiMin = parseInt($("#effectMin").val());
    antiMax = parseInt($("#effectMax").val());
    if (antiMin > 15){
        antiMin = 15;
    }
    if (antiMax > 15){
        antiMax = 15;
    }
    if (antiMin > antiMax){
        antiMax = [antiMin, antiMin = antiMax][0];
    }
    speed = parseFloat($("#speed").val());
    pixelSize = parseFloat($("#pixel").val());
    mutateRate = parseFloat($("#mutate").val());
    conjRate = parseFloat($("#conj").val());
}

function fillRect(x,y,width,height,color){
    draw.fillStyle = color;
    draw.fillRect(x,y,width,height);
}

function renderField(x,y){
    var length = arguments.length;
    //render whole
    if (length === 0){
        for (var i = 0; i < fieldSize; i ++){
            for (var i2 = 0; i2 < fieldSize; i2 ++){
                if (field[i][i2] > 0){
                    var bg = color[field[i][i2]];
                    fillRect(i * pixelSize, i2 * pixelSize, pixelSize, pixelSize, rgb(bg,bg,bg));
                }
            }
        }
    }
    //partial render
    if (length === 2){
        //if normal
        if (field[x][y] === -1){
            fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize, bacteriaC);
        //if mutant
        } else if (field[x][y] === 100){
            fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize, mutantC);
        }
    }
}

function spread(x,y){
    var power = field[x][y];
    if (power === 0){
        return;
    }
    if (field[x - 1] !== undefined){
        if (field[x - 1][y] < power){
            field[x - 1][y] = power - 1;
            spread(x - 1, y);
        }
    }
    if (field[x + 1] !== undefined){
        if (field[x + 1][y] < power){
            field[x + 1][y] = power - 1;
            spread(x + 1, y);
        }
    }
    if (field[x][y + 1] !== undefined){
        if (field[x][y + 1] < power){
            field[x][y + 1] = power - 1;
            spread(x, y + 1);
        }
    }
    if (field[x][y - 1] !== undefined){
        if (field[x][y - 1] < power){
            field[x][y - 1] = power - 1;
            spread(x, y - 1);
        }
    }
}

function spreadBac(){
    //check all tiles adjacent to bacteria, change them to holder
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            if (field[i][i2] === -1){
                if (field[i - 1] !== undefined){
                    if (field[i - 1][i2] === 0){
                        field[i - 1][i2] = -2;
                    }
                }
                if (field[i + 1] !== undefined){
                    if (field[i + 1][i2] === 0){
                        field[i + 1][i2] = -2;
                    }
                }
                if (field[i][i2 + 1] !== undefined){
                    if (field[i][i2 + 1] === 0){
                        field[i][i2 + 1] = -2;
                    }
                }
                if (field[i][i2 - 1] !== undefined){
                    if (field[i][i2 - 1] === 0){
                        field[i][i2 - 1] = -2;
                    }
                }
            }
        }
    }
    
    //change all tile beside mutant bacteria to mutant bacteria
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            if (field[i][i2] === 100){
                var adjacent = getAdjacent(i, i2);
                for (var num = 0; num < adjacent.length; num ++){
                    if (field[adjacent[num][0]][adjacent[num][1]] >= 0 && field[adjacent[num][0]][adjacent[num][1]] < 100){
                        field[adjacent[num][0]][adjacent[num][1]] = 101;
                    }
                }
            }
        }
    }
    
    //change all holder into bacteria
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            if (field[i][i2] === -2){
                field[i][i2] = -1;
                renderField(i, i2);
            } else if (field[i][i2] === 101){
                field[i][i2] = 100;
                renderField(i, i2);
            }
        }
    }
}

function getAdjacent(x,y){
    var array = [];
    if (x - 1 >= 0){
        array.push([x - 1, y]);
    }
    if (x + 1 < fieldSize){
        array.push([x + 1, y]);
    }
    if (y - 1 >= 0){
        array.push([x, y - 1]);
    }
    if (y + 1 < fieldSize){
        array.push([x, y + 1]);
    }
    return array;
}

function checkMutate(){
    for (var i = 0; i < fieldSize; i ++){
        for (var i2 = 0; i2 < fieldSize; i2 ++){
            if (field[i][i2] === -1){
                //grab all adjacents
                var adjacents = getAdjacent(i, i2);
                //loop through adjacents
                for (var num = 0; num < adjacents.length; num ++){
                    //if adjacent is antibiotic
                    if (field[adjacents[num][0]][adjacents[num][1]] > 0 &&field[adjacents[num][0]][adjacents[num][1]] < 100){
                        //check chance
                        var rate = mutateRate * 1000;
                        var chance = 1000 * 1000;
                        //if true, turn tile into mutant
                        if (randomInt(0,chance) < rate){
                            field[i][i2] = 100;
                            renderField(i, i2);
                        }
                    }
                }
            }
        }
    }
}

function conjugation(){
    var times = 1;
    if (conjRate < 1){
        times = parseInt(1 / conjRate);
    }
    //repeating
    for (var repeat = 0; repeat < times; repeat ++){
        //check if turn fits
        if (time % conjRate === 0 || conjRate < 1){
            console.log(repeat);
            //change all to 101 just to be recog.
            for (var i = 0; i < fieldSize; i ++){
                for (var i2 = 0; i2 < fieldSize; i2 ++){
                    if (field[i][i2] === 100){
                        var adjacent = getAdjacent(i, i2);
                        for (var num = 0; num < adjacent.length; num ++){
                            if (field[adjacent[num][0]][adjacent[num][1]] === -1){
                                field[adjacent[num][0]][adjacent[num][1]] = 101;
                            }
                        }
                    }
                }
            }
            //change all 101 to 100 and render
            for (var i = 0; i < fieldSize; i ++){
                for (var i2 = 0; i2 < fieldSize; i2 ++){
                    if (field[i][i2] === 101){
                        field[i][i2] = 100;
                        renderField(i, i2);
                    }
                }
            }
        }
    }
}

function bacSpawn(){
    bacx = randomInt(0, fieldSize - 1);
    bacy = randomInt(0, fieldSize - 1);
    var stack = 0;
    while (field[bacx][bacy] !== 0){
        bacx = randomInt(0, fieldSize - 1);
        bacy = randomInt(0, fieldSize - 1);
        stack ++;
        if (stack > 500){
            word.text("Stack overflow! Lessen the power of antibiotics!");
            return;
        }
    }
    field[bacx][bacy] = -1;
    renderField(bacx, bacy);
    timer = setInterval(function(){
        spreadBac();
        checkMutate();
        conjugation();
        time ++;
        $time.text(time + " turns");
    }, speed * 1000);
}

//jquery
$("#start").click(function(){
    initialize();
});

$("#stop").click(function(){
    clearInterval(timer);
});



