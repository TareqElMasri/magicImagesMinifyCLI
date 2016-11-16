const $ = {
    fs: require('fs-extra'),
    ora: require('ora'),
    glob: require('glob'),
				path: require('path'),
    imagemin: require('imagemin'),
    svgomin: require('imagemin-svgo'),
    webpmin: require('imagemin-webp'),
    mozjpeg: require('imagemin-mozjpeg'),
    pngquant: require('imagemin-pngquant'),
    gifsicle: require('imagemin-gifsicle'),
    $index: 0
};
$.spinner = $.ora('Cleaning preavious build folder').start();
$.fs.emptydir('imagesBuild', (fsError) => {
    if (!fsError) {
        $.spinner.succeed();
        $.spinner = $.ora("Looking for images").start();
        $.glob("**/*.+(webp|jpg|jpeg|png|gif|svg)", (globError, imagesFiles) => {
            $.imagesLength = imagesFiles.length;
            $.calculateProgress = () => {
                return Math.round($.$index / $.imagesLength * 100);
            }
            if (!globError) {
                $.spinner.succeed();
																$.spinner = $.ora("Minifying images").start();
                $.minifyingQ = () => {
                    $.$index++;
																				$.spinner.text = `Minifying images: ${$.$index} of ${$.imagesLength} (${$.calculateProgress()}%)`;
                    $.imagemin([imagesFiles[$.$index - 1]], `imagesBuild/${$.path.dirname(imagesFiles[$.$index - 1])}`, {
                        plugins: [
                            $.mozjpeg(),
                            $.pngquant(),
                            $.gifsicle(),
																												// $.webpmin(), // Exports webp
                            $.svgomin()
                        ]
                    }).then(result => {
                        if ($.$index != $.imagesLength) $.minifyingQ(imagesFiles[$.$index]);
                        else $.spinner.succeed();
                    }, (error => {
                        $.spinner.fail();
																								console.error(error);
                        $.minifyingQ(imagesFiles[$.$index]);
                    }));
                };
                $.minifyingQ();
            } else {
                $.spinner.fail();
                console.error(globError);
            }
        });
    } else {
        $.spinner.fail();
        console.error(error);
    }
});