<?php
class ApiResponse {
    public static function success($data = null, $message = 'Success', $code = 200) {
        http_response_code($code);
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    public static function error($message = 'Error', $code = 400) {
        http_response_code($code);
        return json_encode([
            'success' => false,
            'message' => $message
        ]);
    }
} 