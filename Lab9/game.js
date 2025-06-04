$(document).ready(function() {
    const IMAGE_COUNT_PER_CATEGORY = 50; 
    const GRID_SIZE = 25;

    function generateImagePaths(category, count) {
        let paths = [];
        for (let i = 1; i <= count; i++) {
            paths.push(`photo/${category}/${i}.jpg`);
        }
        return paths;
    }

    const imageSources = {
        landscape: generateImagePaths('landscape', IMAGE_COUNT_PER_CATEGORY), // Ключ має співпадати з data-category і назвою папки
        insects: generateImagePaths('insects', IMAGE_COUNT_PER_CATEGORY),
        fish: generateImagePaths('fish', IMAGE_COUNT_PER_CATEGORY),
    };

    let currentCategoryImages = [];
    let boardImagesSources = [];
    let imagesToFindCount = 0;
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    $('.category-btn').on('click', function() {
        const category = $(this).data('category'); // для тесту landscape
        currentCategoryImages = imageSources[category]; // imageSources.landscape
        
        if (!currentCategoryImages) {
             alert(`Помилка: Категорія "${category}" не знайдена в 'imageSources'. Перевірте ключі об'єкта та 'data-category' в HTML.`);
            return;
        }

        if (currentCategoryImages.length < GRID_SIZE) {
            alert(`Для категорії "${category}" недостатньо картинок (потрібно ${GRID_SIZE}, знайдено ${currentCategoryImages.length}).\nПеревірте папку photo/${category}/ та імена файлів (1.jpg, 2.jpg ...), а також змінну IMAGE_COUNT_PER_CATEGORY.`);
            return;
        }

        $('#categorySelection').hide();
        $('#gameArea').show();
        startGame();
    });

    $('#restartGameBtn').on('click', function() {
        $('#gameArea').hide();
        $('#gameBoard').empty();
        $('#currentImageDraggableWrapper').empty();
        $('#categorySelection').show();
    });

    function startGame() {
        $('#gameBoard').empty();
        $('#currentImageDraggableWrapper').empty();

        boardImagesSources = shuffleArray([...currentCategoryImages]).slice(0, GRID_SIZE);
        imagesToFindCount = GRID_SIZE;

        let tempBoardImages = shuffleArray([...boardImagesSources]);

        for (let i = 0; i < GRID_SIZE; i++) {
            const imgSrc = tempBoardImages[i];
            const cell = $('<div>').addClass('board-cell').data('img-src', imgSrc);
            const img = $('<img>').attr('src', imgSrc).attr('alt', 'ігрова картинка')
                .on('error', function() {
                    $(this).replaceWith($('<p>').text('X').css({'color':'red', 'font-size':'2em', 'text-align':'center'}));
                    console.error("Не вдалося завантажити: " + imgSrc);
                });
            cell.append(img);
            $('#gameBoard').append(cell);

            cell.droppable({
                accept: "#currentDraggableImage",
                hoverClass: "droppable-hover",
                drop: function(event, ui) {
                    const droppedOnSrc = $(this).data('img-src');
                    const draggedSrc = ui.draggable.data('img-src');

                    if (droppedOnSrc === draggedSrc) {
                        $(this).addClass('found').droppable('disable');
                        ui.draggable.remove(); 
                        
                        imagesToFindCount--;
                        console.log("Знайдено! Залишилось знайти:", imagesToFindCount); // тест

                        if (imagesToFindCount > 0) {
                            loadNextDraggableImage();
                        } else {
                            // умова
                            console.log("Всі картинки знайдені!");
                            $("#winDialog").dialog({
                                modal: true,
                                resizable: false,
                                width: 400,
                                buttons: {
                                    "Грати ще!": function() {
                                        $(this).dialog("close");
                                        $('#restartGameBtn').trigger('click');
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
        loadNextDraggableImage();
    }

    function loadNextDraggableImage() {
        $('#currentImageDraggableWrapper').empty();
        
        let remainingImagesOnBoard = [];
        $('.board-cell').each(function() {
            if (!$(this).hasClass('found')) {
                remainingImagesOnBoard.push($(this).data('img-src'));
            }
        });

        if (remainingImagesOnBoard.length === 0 && imagesToFindCount > 0) {
            console.warn("Не залишилось валідних картинок на полі для вибору наступної, хоча гра не завершена.");
            return;
        }
        if (remainingImagesOnBoard.length === 0) return;

        const nextImageSrc = remainingImagesOnBoard[Math.floor(Math.random() * remainingImagesOnBoard.length)];
        
        const draggableImg = $('<img>')
            .attr('id', 'currentDraggableImage')
            .attr('src', nextImageSrc)
            .attr('alt', 'картинка для перетягування')
            .data('img-src', nextImageSrc)
            .on('error', function() {
                console.error("Не вдалося завантажити картинку для перетягування: " + nextImageSrc);
                $('#currentImageDraggableWrapper').html('<p style="color:red;">Помилка завантаження картинки для пошуку. Спробуйте перезавантажити.</p>');
            });

        $('#currentImageDraggableWrapper').append(draggableImg);

        draggableImg.draggable({
            revert: "invalid",
            containment: "document",
            cursor: "grabbing",
            helper: "clone",
            start: function() {
                $(this).css('visibility', 'hidden');
            },
            stop: function() {
                $(this).css('visibility', 'visible');
            }
        });
    }
    $("#winDialog").dialog({ autoOpen: false });
});