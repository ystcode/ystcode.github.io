$(document).ready(function () {
    var $headerInner = $('.header-inner');
    var $sidebar = $('#sidebar');
    var getSidebarTop = function () {
        return $headerInner.height() + CONFIG.sidebar.offset;
    };
    var setSidebarMarginTop = function (sidebarTop) {
        return $sidebar.css({'margin-top': sidebarTop});
    };
    var mql = window.matchMedia('(min-width: 991px)');
    setSidebarMarginTop(getSidebarTop()).show();
    mql.addListener(function (e) {
        if (e.matches) {
            setSidebarMarginTop(getSidebarTop());
        }
    });

    //修改一处markdown渲染code的bug
    $("code").children("span").each(function () {
        if ($(this).children().length !== 0) {
            $(this).remove();
        }
    })
});
