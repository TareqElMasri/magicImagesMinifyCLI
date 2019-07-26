const $ = {
    fs: require('fs-extra'),
    ora: require('ora'),
    glob: require('glob'),
    path: require('path'),
    imagemin: require('imagemin'),
    svgomin: require('imagemin-svgo'),
    jpegtran: require('imagemin-jpegtran'),
    pngquant: require('imagemin-pngquant'),
    gifsicle: require('imagemin-gifsicle'),
    $index: 0
}

$.spinner = $.ora('Cleaning preavious build folder').start()
$.fs.emptydir('imagesBuild', (fsError) => {
    if (!fsError) {
        $.spinner.succeed()
        $.spinner = $.ora("Looking for images").start()
        $.glob("**/*.+(webp|jpg|jpeg|png|gif|svg)", async (globError, imagesFiles) => {
            $.imagesLength = imagesFiles.length
            $.calculateProgress = () => {
                return Math.round($.$index / $.imagesLength * 100)
            }
            if (!globError) {
                $.spinner.succeed()
                $.spinner = $.ora("Minifying images").start()
                try {
                    for (image of imagesFiles) {
                        $.$index++
                        $.spinner.text = `Minifying images: ${$.$index} of ${$.imagesLength} (${$.calculateProgress()}%)`
                        $.imagemin([image], {
                            destination: `imagesBuild/${$.path.dirname(image)}`,
                            plugins: [
                                $.jpegtran(),
                                $.pngquant(),
                                $.gifsicle(),
                                $.svgomin()
                            ]
                        })
                    }
                } catch (error) {
                    $.spinner.fail()
                    console.error(error)    
                }
                $.spinner.succeed()
            } else {
                console.log(globError)
            }
        })
    } else {
        $.spinner.fail()
        console.error(error)
    }
})