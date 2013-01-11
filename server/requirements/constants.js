
/**
 * Server just started,
 * clear the clients stack
 */
exports.clients = {};
exports.client_count = 0;

/**
 * Basic constants
 */
exports.LISTEN_PORT = 5555;
exports.SOCKET_PORT = 9999;

/**
 * Array of allowed writing methods
 */
exports.allowed_methods = [
    'get',
    'post'
];

/**
 * Default values for optional parameters
 * pushed to clients
 */
exports.default_data = {
    'timeout': 20000, // time for visible popup (ms)
    'popup_class': 'normal' // affect the popup css
};

/**
 * White-listed IP table, used to determine permissions
 *
 * IP_WHITE_LIST.read IPs have read permissions
 * IP_WHITE_LIST.write IPs have write permissions
 */
exports.IP_WHITE_LIST = {
    read: [
        '127.0.0.1'
    ],
    write: [
        '127.0.0.1'
    ]
};

