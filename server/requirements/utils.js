
/**
 * Throw a 403 (permission denied) error at the user
 * @param  {Request}  req
 * @param  {Response} res
 */
exports.e403 = function (req, res){
    res.send(403, "You don't have permission to access this resource");
}

/**
 * Throw a 404 (page not found) error at the user
 * @param  {Request}  req
 * @param  {Response} res
 */
exports.e404 = function (req, res){
    res.send(404, "There is nothing here!");
}

/**
 * Check if value is contained in an array
 * @param  {Object}  value
 * @param  {Array}   array
 * @return {Boolean}
 */
exports.is_in_array = function (value, array){
    for (var key in array){
        if (value == array[key]){
            return true;
        }
    }
    return false;
}