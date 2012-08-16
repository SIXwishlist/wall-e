
/**
 * JQuery is required to correctly run this script
 *
 * you can download JQuery from :
 *     http://jquery.com/
 */

var wall_server_address = "http://localhost:9999";
var wall_loaded = false;
var wall_cnotif = 0;

$.getScript(wall_server_address + "/socket.io/socket.io.js", function(){
    wall_loaded = true;
    wall_socket = io.connect(wall_server_address);
});

/**
 * Create basic layout for message display
 *
 * wall_history : view history mode
 * wall_toggle : toggle history mode button
 * wall_popup_zone : popup view zone
 */
function create_pop_up_base(){

    var wall_history = $('<div></div>')
        .hide()
        .addClass('wall_history')
        .append(
            $('<div></div>')
                .addClass('no_results')
                .text('No history.')
        );

    var wall_toggle = $('<div></div>')
        .addClass('wall_toggle')
        .append('alert history') // Displayed text
        .fadeIn(1000)
        .click(function(){
            if ($('.wall_history').css('display') == 'none'){
                $('.wall_history').fadeIn(500);
            } else {
                $('.wall_history').fadeOut(500);
            }
        });

    var wall_popup_zone = $('<div></div>')
        .addClass('wall_popup_zone');

    $('body').append(wall_history);
    $('body').append(wall_toggle);
    $('body').append(wall_popup_zone);
}

/**
 * Register this client to remote wall server
 *
 * @param  {Array} categories  array of registering wall categories
 */
function listen_to_walls(categories){

    /**
     * Check if need socket connected,
     * then register all categories to server.
     * If still not connected, wait.
     */
    function try_register(){

        if (wall_loaded == false){
            return null;
        }

        create_pop_up_base();

        if (typeof(categories.length) == 'undefined'){
            wall_socket.emit('registering', categories);
        } else {
            for (var key in categories){
                wall_socket.emit('registering', categories[key]);
            }
        }

        /**
         * On server pushing, display the alert
         * @param  {Object} datas pushed datas
         */
        wall_socket.on ('pushed', function(datas){

            /**
             * Update a new big popup
             */
            var wall_popup = $('<div></div>')
                .hide()
                .append(
                    $('<div></div>')
                        .addClass('close')
                        .text('close')
                        .click(function(){
                            $(this).parent().remove();
                        })
                )
                .append(
                    $('<h2></h2>')
                        .addClass('title')
                        .html("(" + datas.category + ") " + datas.title)
                )
                .append(
                    $('<p></p>')
                        .addClass('body')
                        .html(datas.message)
                )
                .addClass('wall_popup')
                .addClass(datas.popup_class);

            $('.wall_popup_zone').prepend(wall_popup);

            // Fade animation, remove when finished
            wall_popup.fadeIn(500);
            setTimeout(function(){
                wall_popup.fadeOut(2000);
                setTimeout(function(){
                    wall_popup.remove();
                }, 2000);
            }, parseInt(datas.timeout));


            /**
             * Add message item to history mode
             */
            $('.wall_history').find('.no_results').remove(); // remove no_result annotation
            $('.wall_history').prepend(
                $('<div></div>')
                    .addClass('item')
                    .append(
                        $('<h2></h2>')
                            .addClass('title')
                            .html("On " + new Date() + " : <br/>(" + datas.category + ") " + datas.title)
                    )
                    .append(
                        $('<p></p>')
                            .addClass('body')
                            .text(datas.message)
                    )
                    .addClass(datas.popup_class)
            );
        });

        clearInterval(__connection_interval);
    }

    __connection_interval = setInterval(try_register, 1000);
}