interface schemas {
    BasicData: {
        /** @description 情報を一意に識別するID */
        id?: string;
        _id?: string;
        /** Format: int32 */
        code: number;
        /** @description 受信日時。形式は `2006/01/02 15:04:05.999` です。 */
        time: string;
    };
    JMAQuake: schemas["BasicData"] & {
        /** @description 情報コード。常に551です。 */
        code?: 551;
        /** @description 発表元の情報 */
        issue: {
            /** @description 発表元 */
            source?: string;
            /** @description 発表日時 */
            time: string;
            /**
             * @description 発表種類
             * @enum {string}
             */
            type:
                | "ScalePrompt"
                | "Destination"
                | "ScaleAndDestination"
                | "DetailScale"
                | "Foreign"
                | "Other";
            /**
             * @description 訂正の有無
             * @enum {string}
             */
            correct?:
                | "None"
                | "Unknown"
                | "ScaleOnly"
                | "DestinationOnly"
                | "ScaleAndDestination";
        };
        earthquake: {
            /** @description 発生日時 */
            time: string;
            /** @description 震源情報 */
            hypocenter?: {
                /** @description 名称 */
                name?: string;
                /** @description 緯度。震源情報が存在しない場合は-200となります。 */
                latitude?: number;
                /** @description 経度。震源情報が存在しない場合は-200となります。 */
                longitude?: number;
                /**
                 * Format: int32
                 * @description 深さ(km)。「ごく浅い」は0、震源情報が存在しない場合は-1となります。
                 */
                depth?: number;
                /** @description マグニチュード。震源情報が存在しない場合は-1となります。 */
                magnitude?: number;
            };
            /**
             * Format: int32
             * @description 最大震度。震度情報が存在しない場合は-1となります。
             * @enum {integer}
             */
            maxScale?:
                | "-1"
                | "10"
                | "20"
                | "30"
                | "40"
                | "45"
                | "50"
                | "55"
                | "60"
                | "70";
            /**
             * @description 国内への津波の有無
             * @enum {string}
             */
            domesticTsunami?:
                | "None"
                | "Unknown"
                | "Checking"
                | "NonEffective"
                | "Watch"
                | "Warning";
            /**
             * @description 海外での津波の有無
             * @enum {string}
             */
            foreignTsunami?:
                | "None"
                | "Unknown"
                | "Checking"
                | "NonEffectiveNearby"
                | "WarningNearby"
                | "WarningPacific"
                | "WarningPacificWide"
                | "WarningIndian"
                | "WarningIndianWide"
                | "Potential";
        };
        /** @description 震度観測点の情報 */
        points?: {
            /** @description 都道府県 */
            pref: string;
            /** @description 震度観測点名称（震度速報の場合は [気象庁 | 緊急地震速報や震度情報で用いる区域の名称](http://www.data.jma.go.jp/svd/eqev/data/joho/shindo-name.html) に記載のある区域名） */
            addr: string;
            /** @description 区域名かどうか */
            isArea: boolean;
            /**
             * @description 震度
             * @enum {number}
             */
            scale:
                | "10"
                | "20"
                | "30"
                | "40"
                | "45"
                | "46"
                | "50"
                | "55"
                | "60"
                | "70";
        }[];
    };
    JMAQuakes: schemas["JMAQuake"][];
    JMATsunami: schemas["BasicData"] & {
        /** @description 情報コード。常に552です。 */
        code?: 552;
        /** @description 津波予報が解除されたかどうか。trueの場合、areasは空配列です。 */
        cancelled: boolean;
        /** @description 発表元の情報 */
        issue: {
            /** @description 発表元 */
            source: string;
            /** @description 発表日時 */
            time: string;
            /** @description 発表種類。現在は Focus (津波予報) のみです。 */
            type: string;
        };
        /** @description 津波予報の詳細 */
        areas?: {
            /**
             * @description 津波予報の種類
             * @enum {string}
             */
            grade?: "MajorWarning" | "Warning" | "Watch" | "Unknown";
            /** @description 直ちに津波が来襲すると予想されているかどうか */
            immediate?: boolean;
            /** @description 津波予報区名。[気象庁｜津波予報区について](http://www.data.jma.go.jp/svd/eqev/data/joho/t-yohokuinfo.html)を参照。 */
            name?: string;
        }[];
    };
    JMATsunamis: schemas["JMATsunami"][];
    Userquake: schemas["BasicData"] & {
        /** @description 情報コード。常に561です。 */
        code?: 561;
        /**
         * Format: int32
         * @description 地域コード（コード一覧は [GitHub: epsp-specifications/epsp-area.csv · p2pquake/epsp-specifications](https://github.com/p2pquake/epsp-specifications/blob/master/epsp-area.csv) 参照）
         */
        area: number;
    };
    Areapeers: schemas["BasicData"] & {
        /** @description 情報コード。常に555です。 */
        code?: 555;
        /** @description ピアの地域分布 */
        areas: {
            /**
             * Format: int32
             * @description 地域コード（コード一覧は [GitHub: epsp-specifications/epsp-area.csv · p2pquake/epsp-specifications](https://github.com/p2pquake/epsp-specifications/blob/master/epsp-area.csv) 参照）
             */
            id: number;
            /**
             * Format: int32
             * @description ピア数
             */
            peer: number;
        }[];
    };
    EEWDetection: schemas["BasicData"] & {
        /** @description 情報コード。常に554です。 */
        code?: 554;
        /**
         * @description 検出種類
         * @enum {string}
         */
        type: "Full" | "Chime";
    };
    UserquakeEvaluation: schemas["BasicData"] & {
        /** @description 情報コード。常に9611です。 */
        code?: 9611;
        /**
         * Format: int32
         * @description 件数
         */
        count: number;
        /**
         * @description P2P地震情報 Beta3 における信頼度（0～1）
         * 0: 非表示、0.97015: レベル1、0.96774: レベル2、0.97024: レベル3、0.98052: レベル4。
         * 値は適合率 (precision) です。
         */
        confidence: number;
        /**
         * @description 開始日時。地震感知情報のイベントを一意に識別するキーとなります。
         * 形式は `2006/01/02 15:04:05.999` です。
         */
        started_at?: string;
        /** @description 更新日時。形式は `2006/01/02 15:04:05.999` です。 */
        updated_at?: string;
        /** @description 評価日時。形式は `2006/01/02 15:04:05.999` です。 */
        time?: string;
        /** @description 地域ごとの信頼度情報 */
        area_confidences?: {
            [key: string]: {
                /**
                 * @description 信頼度（0～1）
                 * P2P地震情報 Beta3 においては、 0未満: F、0.0以上0.2未満: E、0.2以上0.4未満: D、0.4以上0.6未満: C、0.6以上0.8未満: B、0.8以上: A です。
                 */
                confidence?: number;
                /**
                 * Format: int32
                 * @description 件数
                 */
                count?: number;
                /** @description P2P地震情報 Beta3 における信頼度表示 */
                display?: string;
            };
        };
    };
}

export type JMAQuake = schemas["JMAQuake"];
export type JMAQuakes = schemas["JMAQuakes"];
export type JMATsunami = schemas["JMATsunami"];
export type JMATsunamis = schemas["JMATsunamis"];
export type Userquake = schemas["Userquake"];
export type Areapeers = schemas["Areapeers"];
export type EEWDetection = schemas["EEWDetection"];
export type UserquakeEvaluation = schemas["UserquakeEvaluation"];

export type WebSocketData =
    | JMAQuake
    | JMATsunami
    | Areapeers
    | EEWDetection
    | Userquake
    | UserquakeEvaluation;
