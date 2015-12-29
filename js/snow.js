var Snow = {
    flakes:[],
    width: 0,
    h:0,
    interval:0,
    tileSize:6,
    tileSizeSmall: 3
}

Snow.random = function(min, max) {
    return Math.random() * (max - min) + min;
}

Snow.init = function(count, imgConfig, capCtx) {

    if (Snow.interval != 0) {
        clearInterval(Snow.interval);
    }
    $('#snowCanvas').remove();
    Snow.flakes = [];
    Snow.width = $(window).width();
    Snow.height = $(window).height();

    var canvasHtml = '<canvas id="snowCanvas" class="snow-canvas" width="'+Snow.width+'" height="'+Snow.height+'"></canvas>';
    $('body').append(canvasHtml);

    var canvas = document.getElementById('snowCanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    Snow.ctx = ctx;

    for (var i=0; i<count; i++) {
        Snow.flakes.push({
            x: Math.random() * Snow.width,
            y: Snow.random(0, 20),
            w: 1,
            r: Math.random() * 3 + 1,
            a: Snow.random(10, 30),
            v: Snow.random(0, 4)
        });
    }

    Snow.imgConfig = imgConfig;
    Snow.capCtx = capCtx;

    Snow.initTiles(imgConfig.cw, imgConfig.ch);

    Snow.interval = setInterval(Snow.draw, 20);
}

Snow.drawFlake = function(ctx, flake) {
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2, true);
}

Snow.draw = function() {
    var fs = Snow.flakes;

    Snow.ctx.clearRect(0, 0, Snow.width, Snow.height);

    Snow.ctx.fillStyle = Snow.imgConfig.snowColor;
    Snow.ctx.beginPath();
    for (var i=0; i<fs.length; i++) {

        if(fs[i].y-50 > Snow.height) {
            fs[i].y = 0;
            fs[i].x = Math.random() * Snow.width;
        }

        switch (i%3) {
            case 0:
                fs[i].y += (1 + fs[i].v);
                fs[i].x += Math.cos(fs[i].w++/fs[i].a);
                break
            case 1:
                fs[i].y += (2 + fs[i].v) ;
                fs[i].x += Math.sin(fs[i].w++/fs[i].a);
                break;
            case 2:
                fs[i].y += (4 + fs[i].v);
                fs[i].x += Math.sin(fs[i].w++/fs[i].a);
                break;
        }

        if (Snow.flakeInImage(fs[i])) {

            var ix = (fs[i].x - Snow.imgConfig.cx1);
            var iy = (fs[i].y - Snow.imgConfig.cy1);
            var tx = Math.floor(ix / Snow.tileSize) - 1;
            var ty = Math.floor(iy / Snow.tileSize) - 1;

            if (ty >= Snow.tileLine) {

                if (Snow.tiles[ty][tx] === 0) {
                    Snow.tiles[ty][tx] = 1;
                    if (ty > 0) {
                        Snow.tiles[ty-1][tx] = 1;
                    }
                    if (ty < Snow.tiles.length-1) {
                        Snow.tiles[ty+1][tx] = 1;
                    }
                    if (tx > 0) {
                        Snow.tiles[ty][tx - 1] = 1;
                    }
                    if (tx < Snow.tiles[0].length-1) {
                        Snow.tiles[ty][tx+1] = 1;
                    }


                    Snow.capCtx.clearRect(ix, iy, Snow.tileSize+2, Snow.tileSize+2);
                    Snow.capCtx.clearRect(ix-Snow.tileSize, iy, Snow.tileSize+2, Snow.tileSize+2);
                    Snow.capCtx.clearRect(ix+Snow.tileSize, iy, Snow.tileSize+2, Snow.tileSize+2);
                    Snow.capCtx.clearRect(ix, iy-Snow.tileSize, Snow.tileSize+2, Snow.tileSize+2);
                    Snow.capCtx.clearRect(ix, iy+Snow.tileSize, Snow.tileSize+2, Snow.tileSize+2);

                    Snow.capCtx.clearRect(ix-Snow.tileSizeSmall, iy-Snow.tileSizeSmall, Snow.tileSizeSmall+1, Snow.tileSizeSmall+1);
                    Snow.capCtx.clearRect(ix+Snow.tileSize, iy+Snow.tileSize, Snow.tileSizeSmall+1, Snow.tileSizeSmall+1);
                    Snow.capCtx.clearRect(ix+Snow.tileSize, iy-Snow.tileSizeSmall, Snow.tileSizeSmall+1, Snow.tileSizeSmall+1);
                    Snow.capCtx.clearRect(ix-Snow.tileSizeSmall, iy+Snow.tileSize, Snow.tileSizeSmall+1, Snow.tileSizeSmall+1);
                }
            }
        }

        Snow.ctx.moveTo(fs[i].x, fs[i].y);
        Snow.ctx.arc(fs[i].x, fs[i].y, fs[i].r, 0, Math.PI * 2, true);
    }
    Snow.ctx.fill();
    Snow.updateTileLine();
}

Snow.flakeInImage = function(flake) {
    return flake.x >= Snow.imgConfig.cx1 && flake.x <= Snow.imgConfig.cx2
        && flake.y >= Snow.imgConfig.cy1 && flake.y <= Snow.imgConfig.cy2;
}

Snow.initTiles = function(cw, ch) {
    Snow.tiles = [];
    var n = Math.floor(ch / Snow.tileSize);
    var m = Math.floor(cw / Snow.tileSize);
    console.log(n);console.log(m);
    Snow.tileLine = n-2;
    for (var i=0; i<n; i++) {
        Snow.tiles.push([]);
        for (var j=0; j<m; j++) {
            Snow.tiles[i].push(0);
        }
    }
}

Snow.checkAndShowTile = function(tx, ty, ix, iy) {
    if (typeof Snow.tiles[ty] != 'undefined' && Snow.tiles[ty][tx] === 0) {
        Snow.tiles[ty][tx] = 1;
        Snow.capCtx.clearRect(ix, iy, Snow.tileSize+1, Snow.tileSize+1);
        return true;
    }
    return false;
}

Snow.updateTileLine = function() {

    if (Snow.tileLine == 0) {
        return;
    }

    var m = Snow.tiles[Snow.tileLine].length;
    var c = 0;
    var min =  Math.floor(0.3*m);
    for (var j=0; j<m; j++) {
        if (Snow.tiles[Snow.tileLine][j] === 1) {
            c++;
        }
        if (c >= min) {
            Snow.tileLine--;
            return;
        }
    }
}
