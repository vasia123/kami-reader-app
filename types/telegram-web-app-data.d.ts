
export interface TelegramWebAppData {
    query_id: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        language_code: string;
        is_premium: boolean;
        allows_write_to_pm: boolean;
    };
    auth_date: string;
    hash: string;
    // tgWebAppVersion: string;
    // tgWebAppPlatform: string;
    // tgWebAppThemeParams: {
    //     accent_text_color: string;
    //     bg_color: string;
    //     button_color: string;
    //     button_text_color: string;
    //     destructive_text_color: string;
    //     header_bg_color: string;
    //     hint_color: string;
    //     link_color: string;
    //     secondary_bg_color: string;
    //     section_bg_color: string;
    //     section_header_text_color: string;
    //     subtitle_text_color: string;
    //     text_color: string;
    // };
}