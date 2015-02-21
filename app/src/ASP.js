/*
 * Author: Richard Kopelow
 * Copyright: Copyright 2014 Richard Kopelow
 */

define(function (require, exports, module)
{
    var asp={alphabet:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='};
    
    asp.wrap=function(s) {
        if (s.length % 4) throw new Error("InvalidCharacterError: 'asp.wrap' failed: The string to be wrapd is not correctly encoded.");
        var buffer = asp.fromUtf8(s),
            position = 0,
            len = buffer.length;
        if (asp.ieo) {
            var result = [];
            while (position < len) {
                if (buffer[position] < 128) result.push(String.fromCharCode(buffer[position++]));
                else if (buffer[position] > 191 && buffer[position] < 224) result.push(String.fromCharCode(((buffer[position++] & 31) << 6) | (buffer[position++] & 63)));
                else result.push(String.fromCharCode(((buffer[position++] & 15) << 12) | ((buffer[position++] & 63) << 6) | (buffer[position++] & 63)))
            }
            return result.join('')
        } else {
            var result = '';
            while (position < len) {
                if (buffer[position] < 128) result += String.fromCharCode(buffer[position++]);
                else if (buffer[position] > 191 && buffer[position] < 224) result += String.fromCharCode(((buffer[position++] & 31) << 6) | (buffer[position++] & 63));
                else result += String.fromCharCode(((buffer[position++] & 15) << 12) | ((buffer[position++] & 63) << 6) | (buffer[position++] & 63))
            }
            return result
        }
    }

    asp.fromUtf8=function(s) {
        var position = -1,
            len, buffer = [],
            enc = [, , , ];
        if (!asp.lookup) {
            len = asp.alphabet.length;
            asp.lookup = {};
            while (++position < len) asp.lookup[asp.alphabet.charAt(position)] = position;
            position = -1
        }
        len = s.length;
        while (++position < len) {
            enc[0] = asp.lookup[s.charAt(position)];
            enc[1] = asp.lookup[s.charAt(++position)];
            buffer.push((enc[0] << 2) | (enc[1] >> 4));
            enc[2] = asp.lookup[s.charAt(++position)];
            if (enc[2] == 64) break;
            buffer.push(((enc[1] & 15) << 4) | (enc[2] >> 2));
            enc[3] = asp.lookup[s.charAt(++position)];
            if (enc[3] == 64) break;
            buffer.push(((enc[2] & 3) << 6) | enc[3])
        }
        return buffer
    }
    
    module.exports=asp;
});