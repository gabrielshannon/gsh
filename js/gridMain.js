document.addEventListener('DOMContentLoaded', function() {

    var grid = null;
    var docElem = document.documentElement;
    var demo = document.querySelector('.grid-demo');
    var gridElement = demo.querySelector('.grid');
    var layoutField = demo.querySelector('.layout-field');
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var dragOrder = [];
    var uuid = 0;
    var filterFieldValue;
    var sortFieldValue;
    var layoutFieldValue;
    var searchFieldValue;

    function initDemo() {

        initGrid();
        sortFieldValue = 'order';

        gridElement.addEventListener('click', function(e) {
            if (elementMatches(e.target, '.card-remove, .card-remove i')) {
                removeItem(e);
                console.log('remove');
            }
        });

        gridElement.addEventListener('click', function(e) {
            if (elementMatches(e.target, '.card-expand, .card-expand i')) {

                var elem = elementClosest(e.target, ".item");
                var clicked = $(elem).attr("data-id");
                var loadItem2 = clicked;
                var itemTemp2 = ($("[data-id=" + loadItem2 + "]"));

                loadPagesModal(itemTemp2);

            }
        });

        gridElement.addEventListener('click', function(e) {

            if (elementMatches(e.target, '.card-add, .card-add i')) {

                var elem = elementClosest(e.target, ".item");
                var clicked = $(elem).attr("data-id");
                addItems(clicked);

                var loadItem2 = clicked;
                var itemTemp2 = ($("[data-id=" + loadItem2 + "]"));

                loadPages(itemTemp2);
                updateIndices();
            }
        });

        gridElement.addEventListener('click', function(e) {
            if (elementMatches(e.target, '.card-expand, .card-expand i')) {
                expandItems(e);
                console.log('anything');
            }
        });

    }

    function initGrid() {

        var dragCounter = 0;

        grid = new Muuri(gridElement, {
            items: generateElements(10),
            layoutDuration: 650,
            layoutEasing: 'ease',
            layout: {
                rounding: false
            },
            dragEnabled: true,
            dragSortHeuristics: {
                sortInterval: 50,
                minDragDistance: 10,
                minBounceBackAngle: 1
            },
            dragContainer: document.body,

            dragStartPredicate: function(item, event) {
                var isDraggable = sortFieldValue === 'order';
                var isRemoveAction = elementMatches(event.target, '.card-remove, .card-remove i, .card-add, .card-add i, .card-expand, .card-expand i, .menu');
                return isDraggable && !isRemoveAction ? Muuri.ItemDrag.defaultStartPredicate(item, event) : false;
            },

            dragPlaceholder: {
                enabled: true,
                duration: 100,
                createElement: function(item) {
                    return item.getElement().cloneNode(true);
                }
            },

            dragReleaseDuration: 400,
            dragReleseEasing: 'ease'
        })

        .on('dragStart', function() {
                ++dragCounter;
                docElem.classList.add('dragging');

            })
            .on('dragEnd', function() {
                if (--dragCounter < 1) {
                    docElem.classList.remove('dragging');
                }
            })

        .on('move', updateIndices)
            .on('sort', updateIndices);

    }

    function filter() {
        grid.filter(function(item) {
            var element = item.getElement();
            var isSearchMatch = !searchFieldValue ? true : (element.getAttribute('data-title') || '').toLowerCase().indexOf(searchFieldValue) > -1;
            var isFilterMatch = !filterFieldValue ? true : (element.getAttribute('data-color') || '') === filterFieldValue;
            return isSearchMatch && isFilterMatch;
        });
    }


    function loadPages(itemTemp) {

        $(itemTemp).find('.card-add').each(function() {

            $(this).parent().addClass('appended');
            var $options = $('.appended').find('option'),
                random = ~~(Math.random() * $options.length);

            $options.eq(random).prop('selected', true);
            var dataUrl = $('.appended').find('option:selected').attr('data-target');
            var dataVal = $('.appended').find('option:selected').attr('value');

            $('.appended').find('.contenth2').load(dataUrl);
            $('.appended').find('.contenth1').load(dataUrl);
            $(".cloned option[value='" + dataVal + "']").prop('selected', true);
            $('.inner-wrap').removeClass('cloned');
            $('.inner-wrap').removeClass('appended');
            $('.inner-wrap').removeClass('cloning');
            $('.inner-wrap').removeClass('enlargewidth');
        });
    }

    function loadPagesModal(itemTemp) {

        $(itemTemp).find('.menu').each(function() {

            $(this).addClass('appended');
            var index = document.getElementsByClassName("menu appended")[0].selectedIndex;

            $('.menu').removeClass('appended');
            var modalEl = document.getElementById('id01');
            $(modalEl).find('.inner-wrap').each(function() {

                $(this).addClass('appended');
                var $options = $('.appended').find('option'),
                    random = ~~(Math.random() * $options.length);
                $options.eq(index).prop('selected', true);

                var dataUrl = $('.appended').find('option:selected').attr('data-target');
                var dataVal = $('.appended').find('option:selected').attr('value');

                $('.appended').find('.contentModal').load(dataUrl, function() {
                    document.getElementById('id01').style.display = 'block';
                });
                $('.appended').find('.contenth1').load(dataUrl, function() {
                    document.getElementById('id01').style.display = 'block';
                });

                $(".cloned option[value='" + dataVal + "']").prop('selected', true);
                $('.inner-wrap').removeClass('cloned');
                $('.inner-wrap').removeClass('appended');
                $('.inner-wrap').removeClass('cloning');
                $('.inner-wrap').removeClass('enlargewidth');

            });
        });

    }


    function addItems(clicked) {

        var newElems = generateElements(1);
        updateIndices();
        newElems.forEach(function(item) {
            item.style.display = 'none';
        });

        var item = (clicked - 1);
        var newItems = grid.add(newElems, { index: item });

        updateIndices();
        if (sortFieldValue !== 'order') {
            grid.sort(sortFieldValue === 'title' ? compareItemTitle : compareItemColor);
            dragOrder = dragOrder.concat(newItems);
        }

        filter();
        var emp = document.getElementsByClassName("item");
        if (emp.length > 10) {
            grid.hide(emp.length - 1, {
                onFinish: function(items) {
                    var item = items[0];
                    grid.remove(item, { removeElements: true });

                    if (sortFieldValue !== 'order') {
                        var itemIndex = dragOrder.indexOf(item);
                        if (itemIndex > -1) {
                            dragOrder.splice(itemIndex, 1);
                        }
                    }
                }

            });
        }
    }

    function removeItem(e) {

        var elem = elementClosest(e.target, '.item');
        grid.hide(elem, {
            onFinish: function(items) {
                var item = items[0];
                grid.remove(item, { removeElements: true });

                if (sortFieldValue !== 'order') {
                    var itemIndex = dragOrder.indexOf(item);
                    if (itemIndex > -1) {
                        dragOrder.splice(itemIndex, 1);
                    }
                }
            }
        });
        updateIndices();
    }

    function generateElements(amount) {

        var ret = [];
        for (var i = 0; i < amount; i++) {
            ret.push(generateElement(++uuid, getRandomInt(1, 2)));
        }

        return ret;

    }

    function generateElement(id, height) {

        var itemElem = document.createElement('div');
        var itemTemplate = '<div class="' + 'item h' + height + '" data-id="' + id + '">' +

            '<div class="item-content">' +
            '<div class="inner-wrap box">' +
            '<div class="card-id">' + '</div>' +

            '<span class="card-add w3-button w3-display-topright">+</span>' +
            '<span class="card-remove w3-button w3-display-topright">×</span>' +
            '<span class="card-expand w3-button w3-display-topright">_</span>' +

            '<div class="menu-wrap box">' +
            '<select class="menu">' +
            '<option value="about" slug = "about" data-target="pages/firstnight.html" >SLMPSNDS, Identity Graphics (1)</option>' +
            '<option value="about" slug = "about" data-target="pages/kida.html" >ROMANIA TOUR PROMO (good luck kidä)</option>' +
            '<option value="about" slug = "about" data-target="pages/tape.html" >SLMPSNDS, Tape 001 (2) // sketchbook pages 2018</option>' +
            '<option value="about" slug = "about" data-target="pages/sidebyside.html" >SLMPSNDS -> SIDEBYSIDE <- (3)</option>' +
            '<option value="about" slug = "about" data-target="pages/beach.html" >towel / print</option>' +
            '<option value="about" slug = "about" data-target ="pages/exomoon.html" > SLMPSNDS, nearest@exomoon cover art (4) </option>' +
            '<option value="about" slug = "about" data-target ="pages/murals.html" > my_mural_and_I </option>' +
            '<option value="about" slug = "about" data-target ="pages/24hrs.html" > SLMPSNDS, 006! (5) </option>' +
            '<option value="about" slug = "about" data-target ="pages/closer.html" > OS-tan </option>' +
            '<option value="about" slug = "about" data-target ="pages/blue.html" > 30/09/2020 </option>' +
            '</select>' +

            '</div>' +

            '<div data-simplebar class="contenth' + height + ' box">' +

            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        itemElem.innerHTML = itemTemplate;
        return itemElem.firstChild;

    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function updateIndices() {

        grid.getItems().forEach(function(item, i) {
            var newId = i + 1;
            item.getElement().setAttribute('data-id', newId);
            item.getElement().querySelector('.card-id').innerHTML = newId;
            if (item._dragPlaceholder.isActive()) {
                item._dragPlaceholder._element.querySelector('.card-id').innerHTML = newId;
            }
        });

    }

    function elementMatches(element, selector) {
        var p = Element.prototype;
        return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector).call(element, selector);
    }

    function elementClosest(element, selector) {

        if (window.Element && !Element.prototype.closest) {
            var isMatch = elementMatches(element, selector);
            while (!isMatch && element && element !== document) {
                element = element.parentNode;
                isMatch = element && element !== document && elementMatches(element, selector);
            }
            return element && element !== document ? element : null;
        } else {
            return element.closest(selector);
        }
    }

    initDemo();

});


(function($) {

    $(document).ready(function() {

        $.fn.SetColWidth = function() {
            var colCount = $(".inner-wrap").length,
                colWidth = 100,
                myArray = [
                    "111612159",
                    "356705689",
                    "181840568"
                ];
            if (colCount === 0) {} else {
                if ($(window).width() > 800) {
                    $(".inner-wrap").css("width", +colWidth + "%");
                }
            }
        }

        var el = document.createElement('div'),
            transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
            transformProp = support(transformProps),
            transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
            transitionDurationProp = support(transitionDuration);

        function support(props) {
            for (var i = 0, l = props.length; i < l; i++) {
                if (typeof el.style[props[i]] !== "undefined") {
                    return props[i];
                }
            }
        }

        $.fn.SetColWidth();
        var previous;

        $(document).on('click', 'select', function(e) {
            previous = $(this).find('option:selected').attr('value');
        }).on('change', 'select', function() {
            var dataUrl = $(this).find('option:selected').attr('data-target');
            var dataVal = $(this).find('option:selected').attr('value');
            $(this).parent().parent().find('.contentModal').load(dataUrl);
            $(this).parent().parent().find('.contenth2').load(dataUrl);
            $(this).parent().parent().find('.contenth1').load(dataUrl);
            $(".cloned option[value='" + dataVal + "']").prop('selected', true)
            $('.inner-wrap').removeClass('cloned');
            $('.inner-wrap').removeClass('cloning');
            $.fn.SetColWidth();
        });

        $('.card-add').each(function() {

            $(this).parent().addClass('appended');
            var $options = $('.appended').find('option'),
                random = ~~(Math.random() * $options.length);

            $options.eq(random).prop('selected', true);

            var dataUrl = $('.appended').find('option:selected').attr('data-target');
            var dataVal = $('.appended').find('option:selected').attr('value');
            $('.appended').find('.contenth1').load(dataUrl);
            $('.appended').find('.contenth2').load(dataUrl);
            $(".cloned option[value='" + dataVal + "']").prop('selected', true);
            $('.inner-wrap').removeClass('cloned');
            $('.inner-wrap').removeClass('appended');
            $('.inner-wrap').removeClass('cloning');
            $('.inner-wrap').removeClass('enlargewidth');

        });

    });

}(jQuery));