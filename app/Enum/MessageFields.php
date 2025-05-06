<?php

namespace App\Enum;

/* 
   public static readonly Dictionary<int, Func<byte[], object>> AVLElements = new()
    {
        {1, Unsigned}, // Digital Input 1
        {2, Unsigned}, // Digital Input 2
        {3, Unsigned}, // Digital Input 3
        {4, Unsigned}, // Digital Input 4
        {5, Unsigned}, // Dallas Temperature ID 5
        {6, Signed}, // Dallas Temperature 5
        {7, Unsigned}, // Dallas Temperature ID 6
        {8, Signed}, // Dallas Temperature 6
        {9, Unsigned}, // Analog Input 1
        {10, Unsigned}, // Analog Input 2
        {11, Unsigned}, // Analog Input 3
        {12, Unsigned}, // Program Number
        {13, Unsigned}, // Module ID
        {14, Unsigned}, // Engine Worktime
        {15, Unsigned}, // Engine Worktime (Counted)
        {16, Unsigned}, // Total Mileage (Counted)
        {17, Unsigned}, // Fuel Consumed (counted)
        {18, Unsigned}, // Fuel Rate
        {19, Unsigned}, // AdBlue Level Percent
        {20, Unsigned}, // AdBlue Level Liters
        {21, Unsigned}, // GSM Signal
        {22, Unsigned}, // Data Mode
        {23, Unsigned}, // Engine Load
        {24, Unsigned}, // Speed
        {25, Signed}, // Engine Temperature
        {26, Unsigned}, // Axle 1 Load
        {27, Unsigned}, // Axle 2 Load
        {28, Unsigned}, // Axle 3 Load
        {29, Unsigned}, // Axle 4 Load
        {30, Unsigned}, // Vehicle Speed
        {31, Unsigned}, // Accelerator Pedal Position
        {32, Unsigned}, // Axle 5 Load
        {33, Unsigned}, // Fuel Consumed
        {34, Unsigned}, // Fuel Level Liters
        {35, Unsigned}, // Engine RPM
        {36, Unsigned}, // Total Mileage
        {37, Unsigned}, // Fuel Level Percent
        {38, Unsigned}, // Control State Flags
        {39, Unsigned}, // Agricultural Machinery Flags
        {40, Unsigned}, // Harvesting Time
        {41, Unsigned}, // Area of Harvest
        {42, Unsigned}, // Mowing Efficiency
        {43, Unsigned}, // Grain Mown Volume
        {44, Unsigned}, // Grain Moisture
        {45, Unsigned}, // Harvesting Drum RPM
        {46, Unsigned}, // Gap Under Harvesting Drum
        {47, Unsigned}, // Security State Flags
        {48, Unsigned}, // Tacho Data Source
        {50, Unsigned}, // Digital Output 3
        {51, Unsigned}, // Digital Output 4
        {52, Unsigned}, // Tacho drive no card
        {56, Unsigned}, // Driver 1 Continuous Driving Time
        {57, Unsigned}, // Driver 2 Continuous Driving Time
        {58, Unsigned}, // Driver 1 Cumulative Break Time
        {59, Unsigned}, // Driver 2 Cumulative Break Time
        {60, Unsigned}, // Driver 1 Selected Activity Duration
        {61, Unsigned}, // Driver 2 Selected Activity Duration
        {62, Unsigned}, // Dallas Temperature ID 1
        {63, Unsigned}, // Dallas Temperature ID 2
        {64, Unsigned}, // Dallas Temperature ID 3
        {65, Unsigned}, // Dallas Temperature ID 4
        {66, Unsigned}, // External Voltage
        {67, Unsigned}, // Battery Voltage
        {68, Unsigned}, // Battery Current
        {69, Unsigned}, // Driver 1 Cumulative Driving Time
        {70, Signed}, // PCB Temperature
        {71, Unsigned}, // GNSS Status
        {72, Signed}, // Dallas Temperature 1
        {73, Signed}, // Dallas Temperature 2
        {74, Signed}, // Dallas Temperature 3
        {75, Signed}, // Dallas Temperature 4
        {76, Unsigned}, // Fuel Counter
        {77, Unsigned}, // Driver 2 Cumulative Driving Time
        {78, Unsigned}, // iButton
        {79, Unsigned}, // Brake Switch
        {80, Unsigned}, // Wheel Based Speed
        {81, Unsigned}, // Cruise Control Active
        {82, Unsigned}, // Clutch Switch
        {83, Unsigned}, // PTO State
        {84, Unsigned}, // Acceleration Pedal Position
        {85, Unsigned}, // Engine Current Load
        {86, Unsigned}, // Engine Total Fuel Used
        {87, Unsigned}, // Fuel Level
        {88, Unsigned}, // Engine Speed
        {89, Unsigned}, // Axle weight 1
        {90, Unsigned}, // Axle weight 2
        {91, Unsigned}, // Axle weight 3
        {92, Unsigned}, // Axle weight 4
        {93, Unsigned}, // Axle weight 5
        {94, Unsigned}, // Axle weight 6
        {95, Unsigned}, // Axle weight 7
        {96, Unsigned}, // Axle weight 8
        {97, Unsigned}, // Axle weight 9
        {98, Unsigned}, // Axle weight 10
        {99, Unsigned}, // Axle weight 11
        {100, Unsigned}, // Axle weight 12
        {101, Unsigned}, // Axle weight 13
        {102, Unsigned}, // Axle weight 14
        {103, Unsigned}, // Axle weight 15
        {104, Unsigned}, // Engine Total Hours Of Operation
        {108, Unsigned}, // Number Of Records
        {109, Unsigned}, // Software Version Supported
        {110, Unsigned}, // Diagnostics Supported
        {111, Unsigned}, // Requests Supported
        {113, Signed}, // Service Distance
        {122, Unsigned}, // Direction Indication
        {123, Unsigned}, // Tachograph Performance
        {124, Unsigned}, // Handling Info
        {125, Unsigned}, // System Event
        {127, Signed}, // Engine Coolant Temperature
        {128, Signed}, // Ambient Air Temperature
        {135, Unsigned}, // Fuel Rate
        {136, Unsigned}, // Instantaneous Fuel Economy
        {137, Unsigned}, // PTO Drive Engagement
        // {138, new FieldMapping("AVL_138","High Resolution Engine Total Fuel Used", Unsigned)},
        {138, Unsigned}, // Engine Fuel used
        {139, Unsigned}, // Gross Combination Vehicle Weight
        {141, Unsigned}, // Battery Temperature
        {142, Unsigned}, // Battery Level Percent
        {143, Unsigned}, // Door Status
        {144, Unsigned}, // SD Status
        {145, Unsigned}, // Manual CAN 00
        {146, Unsigned}, // Manual CAN 01
        {147, Unsigned}, // Manual CAN 02
        {148, Unsigned}, // Manual CAN 03
        {149, Unsigned}, // Manual CAN 04
        {150, Unsigned}, // Manual CAN 05
        {151, Unsigned}, // Manual CAN 06
        {152, Unsigned}, // Manual CAN 07
        {153, Unsigned}, // Manual CAN 08
        {154, Unsigned}, // Manual CAN 09
        {155, Unsigned}, // Geofence zone 01
        {156, Unsigned}, // Geofence zone 02
        {157, Unsigned}, // Geofence zone 03
        {158, Unsigned}, // Geofence zone 04
        {159, Unsigned}, // Geofence zone 05
        {160, Unsigned}, // Geofence zone 06
        {161, Unsigned}, // Geofence zone 07
        {162, Unsigned}, // Geofence zone 08
        {163, Unsigned}, // Geofence zone 09
        {164, Unsigned}, // Geofence zone 10
        {165, Unsigned}, // Geofence zone 11
        {166, Unsigned}, // Geofence zone 12
        {167, Unsigned}, // Geofence zone 13
        {168, Unsigned}, // Geofence zone 14
        {169, Unsigned}, // Geofence zone 15
        {170, Unsigned}, // Geofence zone 16
        {171, Unsigned}, // Geofence zone 17
        {172, Unsigned}, // Geofence zone 18
        {173, Unsigned}, // Geofence zone 19
        {174, Unsigned}, // Geofence zone 20
        {175, Unsigned}, // Auto Geofence
        {176, Unsigned}, // DTC Errors
        {178, Unsigned}, // Network Type
        {179, Unsigned}, // Digital Output 1
        {180, Unsigned}, // Digital Output 2
        {181, Unsigned}, // GNSS PDOP
        {182, Unsigned}, // GNSS HDOP
        {183, Unsigned}, // Drive Recognize
        {184, Unsigned}, // Driver 1 Working State
        {185, Unsigned}, // Driver 2 Working State
        {186, Unsigned}, // Tachograph Over Speed
        {187, Unsigned}, // Driver 1 Card Presence
        {188, Unsigned}, // Driver 2 Card Presence
        {189, Unsigned}, // Driver 1 Time Related States
        {190, Unsigned}, // Driver 2 Time Related States
        {191, Unsigned}, // Vehicle Speed
        // {192, new FieldMapping("AVL_192","Odometer", Unsigned)},
        {192, Unsigned}, // Total Distance
        {193, Unsigned}, // Trip Distance
        {194, Unsigned}, // Timestamp
        {195, DriverIdPart}, // Driver 1 ID MSB
        {196, DriverIdPart}, // Driver 1 ID LSB
        {197, DriverIdPart}, // Driver 2 ID MSB
        {198, DriverIdPart}, // Driver 2 ID LSB
        {199, Unsigned}, // Trip Odometer
        {200, Unsigned}, // Sleep Mode
        {201, Signed}, // LLS 1 Fuel Level
        {202, Signed}, // LLS 1 Temperature
        {203, Signed}, // LLS 2 Fuel Level
        {204, Signed}, // LLS 2 Temperature
        {205, Unsigned}, // GSM Cell ID
        {206, Unsigned}, // GSM Area Code
        {207, Unsigned}, // RFID
        {208, Unsigned}, // Ultrasonic Software Status 1
        {209, Unsigned}, // Ultrasonic Software Status 2
        {210, Signed}, // LLS 3 Fuel Level
        {211, Signed}, // LLS 3 Temperature
        {212, Signed}, // LLS 4 Fuel Level
        {213, Signed}, // LLS 4 Temperature
        {214, Signed}, // LLS 5 Fuel Level
        {215, Signed}, // LLS 5 Temperature
        {216, Unsigned}, // Total Odometer
        {217, Unsigned}, // RFID COM2
        {218, Unsigned}, // IMSI
        {219, Unsigned}, // CCID Part1
        {220, Unsigned}, // CCID Part2
        {221, Unsigned}, // CCID Part3
        {222, Unsigned}, // Card 1 Issuing Member State
        {223, Unsigned}, // Card 2 Issuing Member State
        {224, Signed}, // Ultrasonic Fuel Level 1
        {225, Signed}, // Ultrasonic Fuel Level 2
        {226, Unsigned}, // CNG Status
        {227, Unsigned}, // CNG Used
        {228, Unsigned}, // CNG Level
        {229, Unsigned}, // AdBlue status
        {231, Unsigned}, // Vehicle Registration Number Part1
        {232, Unsigned}, // Vehicle Registration Number Part2
        {233, Unsigned}, // Vehicle Identification Number Part1
        {234, Unsigned}, // Vehicle Identification Number Part2
        {235, Unsigned}, // Vehicle Identification Number Part3
        {236, Signed}, // Axis X
        {237, Signed}, // Axis Y
        {238, Signed}, // Axis Z
        {239, Unsigned}, // Ignition
        {240, Unsigned}, // Movement
        {241, Unsigned}, // Active GSM Operator
        {242, Unsigned}, // Data Limit Hit
        {243, Unsigned}, // Idling
        {244, Unsigned}, // Camera Image Generated
        {245, Unsigned}, // Analog Input 4
        {246, Unsigned}, // Towing
        {247, Unsigned}, // Crash Detection
        {248, Unsigned}, // Geofence Zone Over Speeding
        {249, Unsigned}, // Jamming
        {250, Unsigned}, // Trip
        {251, Unsigned}, // Immobilizer
        {252, Unsigned}, // Authorized Driving
        {253, Unsigned}, // Green Driving Type
        {254, Unsigned}, // Green Driving Value
        {255, Unsigned}, // Over Speeding
        {257, HEX}, // Crash Trace Data
        {258, Unsigned}, // EcoMaximum
        {259, Unsigned}, // EcoAverage
        {260, Unsigned}, // EcoDuration
        {288, Unsigned}, // ME Sound Type
        {289, Unsigned}, // ME Pedestrians in Danger Zone
        {290, Unsigned}, // ME Pedestrians in Forward Collision Warning
        {291, Unsigned}, // ME Time Indicator
        {292, Unsigned}, // ME Error Valid
        {293, Unsigned}, // ME Error Code
        {294, Unsigned}, // ME Zero Speed
        {295, Unsigned}, // ME Headway Valid
        {296, Unsigned}, // ME Headway Measurement
        {297, Unsigned}, // ME LDW Off
        {298, Unsigned}, // ME Left LDW On
        {299, Unsigned}, // ME Right LDW On
        {300, Unsigned}, // ME Maintenance
        {301, Unsigned}, // ME Fail Safe
        {302, Unsigned}, // ME FCW On
        {303, Unsigned}, // ME TSR Enabled
        {304, Unsigned}, // ME Headway Warning Repeat Enabled
        {305, Unsigned}, // ME Headway Warning Level
        {306, Unsigned}, // ME TSR Warning Level
        {307, Unsigned}, // ME Tamper Alert
        {308, Unsigned}, // ME High Beam
        {309, Unsigned}, // ME Low Beam
        {310, Unsigned}, // ME Wipers
        {311, Unsigned}, // ME Right Signal
        {312, Unsigned}, // ME Left Signal
        {313, Unsigned}, // ME Brake Signal
        {314, Unsigned}, // ME Wipers Available
        {315, Unsigned}, // ME Low Beam Available
        {316, Unsigned}, // ME High Beam Available
        {317, Unsigned}, // ME Speed Available
        {318, Unsigned}, // ME Speed
        {319, Unsigned}, // ME TSR 1
        {320, Unsigned}, // ME TSR 2
        {321, Unsigned}, // ME TSR 3
        {322, Unsigned}, // ME TSR 4
        {323, Unsigned}, // ME TSR 5
        {324, Unsigned}, // ME TSR 6
        {325, Unsigned}, // ME TSR 7
        {326, Unsigned}, // ME TSR VO
        {327, Unsigned}, // Geofence zone 21
        {328, Unsigned}, // Geofence zone 22
        {329, Unsigned}, // Geofence zone 23
        {330, Unsigned}, // Geofence zone 24
        {331, Unsigned}, // Geofence zone 25
        {332, Unsigned}, // Geofence zone 26
        {333, Unsigned}, // Geofence zone 27
        {334, Unsigned}, // Geofence zone 28
        {335, Unsigned}, // Geofence zone 29
        {336, Unsigned}, // Geofence zone 30
        {337, Unsigned}, // Geofence zone 31
        {338, Unsigned}, // Geofence zone 32
        {339, Unsigned}, // Geofence zone 33
        {340, Unsigned}, // Geofence zone 34
        {341, Unsigned}, // Geofence zone 35
        {342, Unsigned}, // Geofence zone 36
        {343, Unsigned}, // Geofence zone 37
        {344, Unsigned}, // Geofence zone 38
        {345, Unsigned}, // Geofence zone 39
        {346, Unsigned}, // Geofence zone 40
        {347, Unsigned}, // Geofence zone 41
        {348, Unsigned}, // Geofence zone 42
        {349, Unsigned}, // Geofence zone 43
        {350, Unsigned}, // Geofence zone 44
        {351, Unsigned}, // Geofence zone 45
        {352, Unsigned}, // Geofence zone 46
        {353, Unsigned}, // Geofence zone 47
        {354, Unsigned}, // Geofence zone 48
        {355, Unsigned}, // Geofence zone 49
        {356, Unsigned}, // Geofence zone 50
        {357, Unsigned}, // Brake Pedal Position
        {358, Unsigned}, // Custom Scenario 1
        {359, Unsigned}, // Custom Scenario 2
        {360, Unsigned}, // Custom Scenario 3
        {361, Unsigned}, // Custom Scenario 4
        {380, Unsigned}, // Manual CAN 10
        {381, Unsigned}, // Manual CAN 11
        {382, Unsigned}, // Manual CAN 12
        {383, Unsigned}, // Manual CAN 13
        {384, Unsigned}, // Manual CAN 14
        {385, Unsigned}, // Manual CAN 15
        {386, Unsigned}, // Manual CAN 16
        {387, Unsigned}, // Manual CAN 17
        {388, Unsigned}, // Manual CAN 18
        {389, Unsigned}, // Manual CAN 19
        {483, Unsigned}, // Impulse Counter 2
        {484, Signed}, // External Sensor Temperature 1
        {485, Signed}, // External Sensor Temperature 2
        {486, Signed}, // External Sensor Temperature 3
        {487, Signed}, // External Sensor Temperature 4
        {488, Signed}, // External Sensor Temperature 5
        {489, Signed}, // External Sensor Temperature 6
        {500, Signed}, // Slope Of Arm
        {501, Signed}, // Rotation Of Arm
        {502, Unsigned}, // Eject Of Arm
        {503, Unsigned}, // Horizontal Distance Arm
        {504, Unsigned}, // Height Arm Above Ground
        {505, Unsigned}, // Drill RPM
        {506, Unsigned}, // Spread Salt
        {507, Unsigned}, // Battery Voltage
        {508, Unsigned}, // Spread Fine Grained Salt
        {509, Unsigned}, // Coarse Grained Salt
        {510, Unsigned}, // Spread DiMix
        {511, Unsigned}, // Spread Coarse Grained Calcium
        {512, Unsigned}, // Spread Calcium Chloride
        {513, Unsigned}, // Spread Sodium Chloride
        {514, Unsigned}, // Spread Magnesium Chloride, m2
        {515, Unsigned}, // Amount Of Spread Gravel
        {516, Unsigned}, // Amount Of Spread Sand
        {517, Unsigned}, // Width Pouring Left
        {518, Unsigned}, // Width Pouring Right
        {519, Unsigned}, // Salt Spreader Working Hours
        {520, Unsigned}, // Distance During Salting
        {521, Unsigned}, // Load Weight
        {522, Unsigned}, // Retarder Load
        {523, Unsigned}, // Cruise Time
        {524, Unsigned}, // Engine Oil Level
        {525, ASCII}, // Fault Codes
        {526, Unsigned}, // Vehicles Range On Battery
        {527, Unsigned}, // Vehicles Range On Additional Fuel
        {528, ASCII}, // VIN
        {529, HEX}, // Module ID 17B
        {550, Unsigned}, // Geofence zone 51
        {551, Unsigned}, // Geofence zone 52
        {552, Unsigned}, // Geofence zone 53
        {553, Unsigned}, // Geofence zone 54
        {554, Unsigned}, // Geofence zone 55
        {555, Unsigned}, // Geofence zone 56
        {556, Unsigned}, // Geofence zone 57
        {557, Unsigned}, // Geofence zone 58
        {558, Unsigned}, // Geofence zone 59
        {559, Unsigned}, // Geofence zone 60
        {560, Unsigned}, // Geofence zone 61
        {561, Unsigned}, // Geofence zone 62
        {562, Unsigned}, // Geofence zone 63
        {563, Unsigned}, // Geofence zone 64
        {564, Unsigned}, // Geofence zone 65
        {565, Unsigned}, // Geofence zone 66
        {566, Unsigned}, // Geofence zone 67
        {567, Unsigned}, // Geofence zone 68
        {568, Unsigned}, // Geofence zone 69
        {569, Unsigned}, // Geofence zone 70
        {570, Unsigned}, // Geofence zone 71
        {571, Unsigned}, // Geofence zone 72
        {572, Unsigned}, // Geofence zone 73
        {573, Unsigned}, // Geofence zone 74
        {574, Unsigned}, // Geofence zone 75
        {575, Unsigned}, // Geofence zone 76
        {576, Unsigned}, // Geofence zone 77
        {577, Unsigned}, // Geofence zone 78
        {578, Unsigned}, // Geofence zone 79
        {579, Unsigned}, // Geofence zone 80
        {580, Unsigned}, // Geofence zone 81
        {581, Unsigned}, // Geofence zone 82
        {582, Unsigned}, // Geofence zone 83
        {583, Unsigned}, // Geofence zone 84
        {584, Unsigned}, // Geofence zone 85
        {585, Unsigned}, // Geofence zone 86
        {586, Unsigned}, // Geofence zone 87
        {587, Unsigned}, // Geofence zone 88
        {588, Unsigned}, // Geofence zone 89
        {589, Unsigned}, // Geofence zone 90
        {590, Unsigned}, // Geofence zone 91
        {591, Unsigned}, // Geofence zone 92
        {592, Unsigned}, // Geofence zone 93
        {593, Unsigned}, // Geofence zone 94
        {594, Unsigned}, // Geofence zone 95
        {595, Unsigned}, // Geofence zone 96
        {596, Unsigned}, // Geofence zone 97
        {597, Unsigned}, // Geofence zone 98
        {598, Unsigned}, // Geofence zone 99
        {599, Unsigned}, // Geofence zone 100
        {600, Unsigned}, // ADAS Speed
        {601, Unsigned}, // ADAS Left turn signal
        {602, Unsigned}, // ADAS Right turn signal //  Note: Doc says 601 for this item but it's probably a typo
        {603, Unsigned}, // ADAS Brake signal
        {604, Unsigned}, // ADAS RPM
        {605, Unsigned}, // ADAS LDW Left
        {606, Unsigned}, // ADAS LDW Right
        {607, Unsigned}, // ADAS Left distance
        {608, Unsigned}, // ADAS Right distance
        {609, Unsigned}, // ADAS Time till collision
        {610, Unsigned}, // ADAS Safety distance alert
        {611, Unsigned}, // ADAS Front vehicle start alarm
        {612, Unsigned}, // ADAS Front proximity warning
        {613, Unsigned}, // ADAS Front collision warning
        {614, Unsigned}, // ADAS PCW
        {615, Unsigned}, // ADAS Record
        {616, Unsigned}, // ADAS Error code
        {617, Unsigned}, // ADAS Ahead distance
        {618, Unsigned}, // ADAS Ahead speed
        {619, Unsigned}, // ADAS SLR state
        {620, Unsigned}, // ADAS SLR Recognise
        {621, Unsigned}, // ADAS SLR Sensitivity
        {665, Unsigned}, // ADAS SD card status
        {666, Unsigned}, // ADAS camera state
        {667, HEX}, // ADAS record data
        {701, Signed}, // BLE 1 Temperature
        {702, Signed}, // BLE 2 Temperature
        {703, Signed}, // BLE 3 Temperature
        {704, Signed}, // BLE 4 Temperature
        {705, Unsigned}, // BLE 1 Battery Voltage
        {706, Unsigned}, // BLE 2 Battery Voltage
        {707, Unsigned}, // BLE 3 Battery Voltage
        {708, Unsigned}, // BLE 4 Battery Voltage
        {709, Unsigned}, // BLE 1 Humidity
        {710, Unsigned}, // BLE 2 Humidity
        {711, Unsigned}, // BLE 3 Humidity
        {712, Unsigned}, // BLE 4 Humidity
        {713, Unsigned}, // BLE Sensor Custom 1
        {714, Unsigned}, // BLE Sensor Custom 2
        {715, Unsigned}, // BLE Sensor Custom 3
        {716, Unsigned}, // BLE Sensor Custom 4
        {717, Unsigned}, // BLE Illum1
        {718, Unsigned}, // BLE Illum2
        {719, Unsigned}, // BLE Illum3
        {720, Unsigned}, // BLE Illum4
        {721, Unsigned}, // BLE LLS Fuel 1
        {722, Unsigned}, // BLE LLS Fuel 2
        {723, Unsigned}, // BLE LLS Fuel 3
        {724, Unsigned}, // BLE LLS Fuel 4
        {725, Unsigned}, // BLE Freq 1
        {726, Unsigned}, // BLE Freq 2
        {727, Unsigned}, // BLE Freq 3
        {728, Unsigned}, // BLE Freq 4
        {729, Unsigned}, // BLE Senosr Custom 12
        {730, Unsigned}, // BLE Senosr Custom 13
        {731, Unsigned}, // BLE Senosr Custom 14
        {732, Unsigned}, // BLE Senosr Custom 15
        {733, Unsigned}, // BLE Senosr Custom 22
        {734, Unsigned}, // BLE Senosr Custom 23
        {735, Unsigned}, // BLE Senosr Custom 24
        {736, Unsigned}, // BLE Senosr Custom 25
        {737, Unsigned}, // BLE Senosr Custom 32
        {738, Unsigned}, // BLE Senosr Custom 33
        {739, Unsigned}, // BLE Senosr Custom 34
        {740, Unsigned}, // BLE Senosr Custom 35
        {741, Unsigned}, // BLE Senosr Custom 42
        {742, Unsigned}, // BLE Senosr Custom 43
        {743, Unsigned}, // BLE Senosr Custom 44
        {744, Unsigned}, // BLE Senosr Custom 45
        {10009, Unsigned}, // Eco score
        {10040, Unsigned}, // Inbox Fuel
        {10041, Unsigned}, // Inbox Battery
        {10042, Unsigned}, // Inbox TELH
        {10043, Unsigned}, // Inbox TVH
        {10044, Unsigned}, // Inbox TENH
        {10045, Unsigned}, // Zone 1 Compartment state
        {10046, Unsigned}, // Zone 1 Compartment mode
        {10047, Signed}, // Zone 1 Return Air Sensor 1
        {10048, Signed}, // Zone 1 Supply Air Sensor 1
        {10049, Signed}, // Zone 1 Set Temperature
        {10050, Signed}, // Zone 1 Evaporator temperature
        {10051, Signed}, // Zone 1 Return Air Sensor 2
        {10052, Signed}, // Zone 1 Supply Air Sensor 2
        {10053, Unsigned}, // Z1 Power mode
        {10054, Unsigned}, // Zone 2 Compartment state
        {10055, Unsigned}, // Zone 2 Compartment mode
        {10056, Signed}, // Zone 2 Return Air Sensor 1
        {10057, Signed}, // Zone 2 Supply Air Sensor 1
        {10058, Signed}, // Zone 2 Set Temperature
        {10059, Signed}, // Zone 2 Evaporator temperature
        {10060, Signed}, // Zone 2 Return Air sensor 2
        {10061, Signed}, // Zone 2 Supply Air sensor 2
        {10063, Unsigned}, // Zone 3 Compartment state
        {10064, Unsigned}, // Zone 3 Compartment mode
        {10065, Signed}, // Zone 3 Return Air sensor 1
        {10066, Signed}, // Zone 3 Supply Air sensor 1
        {10067, Signed}, // Zone 3 Set Temperature
        {10068, Signed}, // Zone 3 Evaporator temperature
        {10069, Signed}, // Zone 3 Return Air sensor 2
        {10070, Signed}, // Zone 3 Supply Air sensor 2
        {10071, Unsigned}, // Zone 3 Operating Mode
        {10189, Unsigned}, // Total Tires
        {10190, Unsigned}, // Total Axles
        {10191, Unsigned}, // Graphical Position
        {10192, HEX}, // Tire 1 pressure
        {10193, HEX}, // Tire 2 pressure
        {10194, HEX}, // Tire 3 pressure
        {10195, HEX}, // Tire 4 pressure
        {10196, HEX}, // Tire 5 pressure
        {10197, HEX}, // Tire 6 pressure
        {10198, HEX}, // Tire 7 pressure
        {10199, HEX}, // Tire 8 pressure
        {10200, HEX}, // Tire 9 pressure
        {10201, HEX}, // Tire 10 pressure
        {10202, HEX}, // Tire 11 pressure
        {10203, HEX}, // Tire 12 pressure
        {10204, HEX}, // Tire 13 pressure
        {10205, HEX}, // Tire 14 pressure
        {10206, HEX}, // Tire 15 pressure
        {10207, HEX}, // Tire 16 pressure
        {10208, HEX}, // Tire 17 pressure
        {10209, HEX}, // Tire 18 pressure
        {10210, HEX}, // Tire 19 pressure
        {10211, HEX}, // Tire 20 pressure
        {10212, HEX}, // Tire 21 pressure
        {10213, HEX}, // Tire 22 pressure
        {10214, HEX}, // Tire 23 pressure
        {10215, HEX}, // Tire 24 pressure
        {10298, Unsigned}, // Manual CAN 20
        {10299, Unsigned}, // Manual CAN 21
        {10300, Unsigned}, // Manual CAN 22
        {10301, Unsigned}, // Manual CAN 23
        {10302, Unsigned}, // Manual CAN 24
        {10303, Unsigned}, // Manual CAN 25
        {10304, Unsigned}, // Manual CAN 26
        {10305, Unsigned}, // Manual CAN 27
        {10306, Unsigned}, // Manual CAN 28
        {10307, Unsigned}, // Manual CAN 29
        {10308, Unsigned}, // Manual CAN 30
        {10309, Unsigned}, // Manual CAN 31
        {10310, Unsigned}, // Manual CAN 32
        {10311, Unsigned}, // Manual CAN 33
        {10312, Unsigned}, // Manual CAN 34
        {10313, Unsigned}, // Manual CAN 35
        {10314, Unsigned}, // Manual CAN 36
        {10315, Unsigned}, // Manual CAN 37
        {10316, Unsigned}, // Manual CAN 38
        {10317, Unsigned}, // Manual CAN 39
        {10318, Unsigned}, // Manual CAN 40
        {10319, Unsigned}, // Manual CAN 41
        {10320, Unsigned}, // Manual CAN 42
        {10321, Unsigned}, // Manual CAN 43
        {10322, Unsigned}, // Manual CAN 44
        {10323, Unsigned}, // Manual CAN 45
        {10324, Unsigned}, // Manual CAN 46
        {10325, Unsigned}, // Manual CAN 47
        {10326, Unsigned}, // Manual CAN 48
        {10327, Unsigned}, // Manual CAN 49
        {10328, Unsigned}, // Manual CAN 50
        {10329, Unsigned}, // Manual CAN 51
        {10330, Unsigned}, // Manual CAN 52
        {10331, Unsigned}, // Manual CAN 53
        {10332, Unsigned}, // Manual CAN 54
        {10333, Unsigned}, // Manual CAN 55
        {10334, Unsigned}, // Manual CAN 56
        {10335, Unsigned}, // Manual CAN 57
        {10336, Unsigned}, // Manual CAN 58
        {10337, Unsigned}, // Manual CAN 59
        {10338, Unsigned}, // Manual CAN 60
        {10339, Unsigned}, // Manual CAN 61
        {10340, Unsigned}, // Manual CAN 62
        {10341, Unsigned}, // Manual CAN 63
        {10342, Unsigned}, // Manual CAN 64
        {10343, Unsigned}, // Manual CAN 65
        {10344, Unsigned}, // Manual CAN 66
        {10345, Unsigned}, // Manual CAN 67
        {10346, Unsigned}, // Manual CAN 68
        {10347, Unsigned}, // Manual CAN 69
        {10348, Unsigned}, // Fuel level 2
        {10349, Unsigned}, // MIL indicator
        {10350, Signed}, // Ambient Air Temperature
        {10351, Signed}, // Compressor Coolant Temperature
        {10352, Unsigned}, // Alarm level
        {10353, Unsigned}, // Compressor Config
        {10354, Unsigned}, // Communication state flags
        {10355, Unsigned}, // Door Status
        {10356, Unsigned}, // Installation Serial
        {10357, Unsigned}, // Trailer Serial
        {10360, HEX}, // Tire 1 Temperature
        {10361, HEX}, // Tire 1 Warning
        {10362, HEX}, // Tire 2 Temperature
        {10363, HEX}, // Tire 2 Warning
        {10364, HEX}, // Tire 3 Temperature
        {10365, HEX}, // Tire 3 Warning
        {10366, HEX}, // Tire 4 Temperature
        {10367, HEX}, // Tire 4 Warning
        {10368, HEX}, // Tire 5 Temperature
        {10369, HEX}, // Tire 5 Warning
        {10370, HEX}, // Tire 6 Temperature
        {10371, HEX}, // Tire 6 Warning
        {10372, HEX}, // Tire 7 Temperature
        {10373, HEX}, // Tire 7 Warning
        {10374, HEX}, // Tire 8 Temperature
        {10375, HEX}, // Tire 8 Warning
        {10376, HEX}, // Tire 9 Temperature
        {10377, HEX}, // Tire 9 Warning
        {10378, HEX}, // Tire 10 Temperature
        {10379, HEX}, // Tire 10 Warning
        {10380, HEX}, // Tire 11 Temperature
        {10381, HEX}, // Tire 11 Warning
        {10382, HEX}, // Tire 12 Temperature
        {10383, HEX}, // Tire 12 Warning
        {10384, HEX}, // Tire 13 Temperature
        {10385, HEX}, // Tire 13 Warning
        {10386, HEX}, // Tire 14 Temperature
        {10387, HEX}, // Tire 14 Warning
        {10388, HEX}, // Tire 15 Temperature
        {10389, HEX}, // Tire 15 Warning
        {10390, HEX}, // Tire 16 Temperature
        {10391, HEX}, // Tire 16 Warning
        {10392, HEX}, // Tire 17 Temperature
        {10393, HEX}, // Tire 17 Warning
        {10394, HEX}, // Tire 18 Temperature
        {10395, HEX}, // Tire 18 Warning
        {10396, HEX}, // Tire 19 Temperature
        {10397, HEX}, // Tire 19 Warning
        {10398, HEX}, // Tire 20 Temperature
        {10399, HEX}, // Tire 20 Warning
        {10400, HEX}, // Tire 21 Temperature
        {10401, HEX}, // Tire 21 Warning
        {10402, HEX}, // Tire 22 Temperature
        {10403, HEX}, // Tire 22 Warning
        {10404, HEX}, // Tire 23 Temperature
        {10405, HEX}, // Tire 23 Warning
        {10406, HEX}, // Tire 24 Temperature
        {10407, HEX}, // Tire 24 Warning
        {10428, HEX}, // Tell Tale 0
        {10429, HEX}, // Tell Tale 1
        {10430, HEX}, // Tell Tale 2
        {10431, HEX}, // Tell Tale 3
        {10455, Unsigned}, // AdBlue level
        {10464, Unsigned}, // External Digital Sensor 1
        {10465, Unsigned}, // External Digital Sensor 2
        {10466, Unsigned}, // External Digital Sensor 3
        {10467, Unsigned}, // External Digital Sensor 4
        {10468, Unsigned}, // Analog Input 1
        {10469, Unsigned}, // Analog Input 2
        {10470, Unsigned}, // Analog Input 3
        {10472, Unsigned}, // Manufacturer ID
        {10473, Unsigned}, // Battery State Flags
        {10474, Unsigned}, // Fuel state flags
        {10475, Unsigned}, // Maintenance 1 Hours
        {10476, Unsigned}, // Maintenance 2 Hours
        {10477, Unsigned}, // Maintenance 3 Hours
        {10478, Unsigned}, // Maintenance 4 Hours
        {10479, Unsigned}, // Maintenance 5 Hours
        {10480, Unsigned}, // Run Mode
        {10481, Signed}, // External Temperature 1
        {10482, Signed}, // External Temperature 2
        {10483, Signed}, // External Temperature 3
        {10484, Signed}, // External Temperature 4
        {10485, Signed}, // External Temperature 5
        {10486, Signed}, // External Temperature 6
        {10487, Unsigned}, // 1Wire Humidity 1
        {10488, Unsigned}, // 1Wire Humidity 2
        {10489, Unsigned}, // 1Wire Humidity 3
        {10490, Unsigned}, // 1Wire Humidity 4
        {10491, Unsigned}, // 1Wire Humidity 5
        {10492, Unsigned}, // 1Wire Humidity 6
        {10493, Unsigned}, // DTC DM1
        {10494, Unsigned}, // DTC Time DM1
        {10495, Unsigned}, // DTC DM2
        {10496, Unsigned}, // DTC Time DM2
        {10501, Unsigned}, // Drivers hours rules pre warning time delay
        {10502, Unsigned}, // Out Of Scope Condition
        {10503, Unsigned}, // Next Calibration Date
        {10504, Unsigned}, // Driver 1 end of last daily rest report
        {10505, Unsigned}, // Driver 1 end of last weekly rest period
        {10506, Unsigned}, // Driver 1 end of second last weekly rest period
        {10507, Unsigned}, // Driver 1 current daily driving time
        {10508, Unsigned}, // Driver 1 current weekly driving time
        {10509, Unsigned}, // Driver 1 time left until new daily rest period
        {10510, Unsigned}, // Driver 1 number of times 9h daily driving time exceeds
        {10511, Unsigned}, // Driver 2 end of last daily rest report
        {10512, Unsigned}, // Driver 2 end of last weekly rest period
        {10513, Unsigned}, // Driver 2 end of second last weekly rest period
        {10514, Unsigned}, // Driver 2 current daily driving time
        {10515, Unsigned}, // Driver 2 current weekly driving time
        {10516, Unsigned}, // Driver 2 time left until new daily rest period
        {10517, Unsigned}, // Driver 2 number of times 9h daily driving time exceeds
        {10518, ASCII}, // Driver 1 Name
        {10519, ASCII}, // Driver 1 SurName
        {10520, ASCII}, // Driver 2 Name
        {10521, ASCII}, // Driver 2 SurName
        {10522, Unsigned}, // Driver 1 Time Left Until New Weekly Rest Period
        {10523, Unsigned}, // Driver 2 Time Left Until New Weekly Rest Period
        {10524, Unsigned}, // Driver 1 Minimum Daily Rest
        {10525, Unsigned}, // Driver 2 Minimum Daily Rest
        {10526, Unsigned}, // Driver 1 Minimum Weekly Rest
        {10527, Unsigned}, // Driver 2 Minimum Weekly Rest
        {10528, Unsigned}, // Driver 1 Duration Of Next Break Rest
        {10529, Unsigned}, // Driver 2 Duration Of Next Break Rest
        {10530, Unsigned}, // Driver 1 Remaining Time Until Next Break Or Rest
        {10531, Unsigned}, // Driver 2 Remaining Time Until Next Break Or Rest
        {10532, Unsigned}, // Driver 1 Remaining Current Driving Time
        {10533, Unsigned}, // Driver 1 Remaining Driving Time On Current Shift
        {10534, Unsigned}, // Driver 1 Remaining Driving Time Of Current Week
        {10535, Unsigned}, // Driver 1 Open Compensation In The Last Week
        {10536, Unsigned}, // Driver 1 Open Compensation In Week Before Last
        {10537, Unsigned}, // Driver 1 Open Compensation In 2nd Week Before Last
        {10538, Unsigned}, // Driver 1 Additional Information
        {10539, Unsigned}, // Driver 1 Remaining Time Of Current Break Rest
        {10540, Unsigned}, // Driver 1 Time Left Until Next Driving Period
        {10541, Unsigned}, // Driver 1 Duration Of Next Driving Period
        {10611, HEX}, // RS232_COM1Data
        {10612, HEX}, // RS232_COM2Data
        {10631, Unsigned}, // LVCAN Driver Seatbelt
        {10632, Unsigned}, // LVCAN Front Passenger Seatbelt
        {10639, HEX}, // Error Codes
        {10640, Unsigned}, // Impulse counter frequency 1
        {10641, Unsigned}, // Impulse counter RPM 1
        {10642, Unsigned}, // Impulse counter frequency 2
        {10643, Unsigned}, // Impulse counter RPM 2
        {10644, Signed}, // Temperature Probe 1
        {10645, Signed}, // Temperature Probe 2
        {10646, Signed}, // Temperature Probe 3
        {10647, Signed}, // Temperature Probe 4
        {10648, Signed}, // Temperature Probe 5
        {10649, Signed}, // Temperature Probe 6
        {10683, Signed}, // Temperature 1
        {10684, Signed}, // Temperature 2
        {10685, Signed}, // Temperature 3
        {10686, Signed}, // Temperature 4
        {10687, Unsigned}, // Status 1
        {10688, Unsigned}, // Status 2
        {10689, Unsigned}, // Status 3
        {10690, Unsigned}, // Status 4
        {10691, Unsigned}, // Alarm 1
        {10692, Unsigned}, // Alarm 2
        {10693, Unsigned}, // Alarm 3
        {10694, Unsigned}, // Alarm 4
        {10695, Signed}, // Input 1
        {10696, Signed}, // Input 2
        {10697, Signed}, // Input 3
        {10698, Signed}, // Input 4
        {10699, Signed}, // Input 5
        {10700, Signed}, // Input 6
        {10701, Signed}, // Setpoint 1
        {10702, Signed}, // Setpoint 2
        {10703, Signed}, // Setpoint 3
        {10911, Unsigned}, // Impulse counter value 1
        {10912, Unsigned}, // Impulse counter value 3
        {10913, Unsigned}, // Impulse counter frequency 3
        {10914, Unsigned}, // Impulse counter RPM 3
        {10915, Unsigned}, // Impulse counter value 4
        {10916, Unsigned}, // Impulse counter frequency 4
        {10917, Unsigned}, // Impulse counter RPM 4
        {11700, Unsigned}, // DSM drowsiness event
        {11701, Unsigned}, // DSM distraction event
        {11702, Unsigned}, // DSM yawning event
        {11703, Unsigned}, // DSM phone event
        {11704, Unsigned}, // DSM smoking event
        {11705, Unsigned}, // DSM driver absence event
        {11706, Unsigned}, // DSM mask event
        {11707, Unsigned}, // DSM G-sensor event
        {11708, ASCII}, // DSM active driver name
        {11709, Unsigned}, // DSM recording status
        {11710, Unsigned}, // DSM GPS status
        {11711, Unsigned}, // DSM speed
        {11712, HEX}, // DSM error code
        {11713, Unsigned}, // DSM seatbelt detection
        {11714, Unsigned}, // DSM state
        {12000, Unsigned}, // Event IO ID
        {12001, String}, // Active Driver ID
        {12002, String}, // VIN Number
        {12003, Unsigned}, // Event Counter
        {12010, Unsigned}, // Coasting Distance
        {12011, Unsigned}, // Coasting Fuel Used
        {12012, Unsigned}, // Coasting Time
        {12013, Unsigned}, // EcoRoll Distance
        {12014, Unsigned}, // EcoRoll Fuel Used
        {12015, Unsigned}, // EcoRoll Time
        {12016, Unsigned}, // Braking Distance
        {12017, Unsigned}, // Braking Fuel Used
        {12018, Unsigned}, // Braking Time
        {12019, Unsigned}, // Braking Count
        {12020, Unsigned}, // Retarder Distance
        {12021, Unsigned}, // Retarder Fuel Used
        {12022, Unsigned}, // Retarder Time
        {12023, Unsigned}, // Cruise Distance
        {12024, Unsigned}, // Cruise Fuel Used
        {12025, Unsigned}, // Cruise Time
        {12026, Unsigned}, // Torque Distance
        {12027, Unsigned}, // Torque Fuel Used
        {12028, Unsigned}, // Torque Time
        {12029, Unsigned}, // PTO Distance
        {12030, Unsigned}, // PTO Fuel Used
        {12031, Unsigned}, // PTO Time
        {12032, Unsigned}, // Fuel While Driving fuel
        {12033, Unsigned}, // Fuel While Idle fuel
        {12034, Unsigned}, // Engine Load fuel
        {12035, Unsigned}, // Total Distance
        {12036, Unsigned}, // Total Fuel Used
        {12037, Unsigned}, // Total Time
        {12050, Unsigned}, // Short Stops Count
        {12051, Unsigned}, // Long Stops Count
        {12052, Unsigned}, // Parking brake Count
        {12053, Unsigned}, // Harsh Acceleration Count
        {12054, Unsigned}, // Harsh Braking Count
        {12055, Unsigned}, // Harsh Cornering Count
        {12100, Unsigned}, // Speed Range 1 Distance
        {12101, Unsigned}, // Speed Range 2 Distance
        {12102, Unsigned}, // Speed Range 3 Distance
        {12103, Unsigned}, // Speed Range 4 Distance
        {12104, Unsigned}, // Speed Range 5 Distance
        {12105, Unsigned}, // Speed Range 6 Distance
        {12106, Unsigned}, // Speed Range 7 Distance
        {12107, Unsigned}, // Speed Range 8 Distance
        {12108, Unsigned}, // Speed Range 9 Distance
        {12109, Unsigned}, // Speed Range 10 Distance
        {12110, Unsigned}, // Speed Range 1 Fuel used
        {12111, Unsigned}, // Speed Range 2 Fuel used
        {12112, Unsigned}, // Speed Range 3 Fuel used
        {12113, Unsigned}, // Speed Range 4 Fuel used
        {12114, Unsigned}, // Speed Range 5 Fuel used
        {12115, Unsigned}, // Speed Range 6 Fuel used
        {12116, Unsigned}, // Speed Range 7 Fuel used
        {12117, Unsigned}, // Speed Range 8 Fuel used
        {12118, Unsigned}, // Speed Range 9 Fuel used
        {12119, Unsigned}, // Speed Range 10 Fuel used
        {12120, Unsigned}, // Speed Range 1 Time
        {12121, Unsigned}, // Speed Range 2 Time
        {12122, Unsigned}, // Speed Range 3 Time
        {12123, Unsigned}, // Speed Range 4 Time
        {12124, Unsigned}, // Speed Range 5 Time
        {12125, Unsigned}, // Speed Range 6 Time
        {12126, Unsigned}, // Speed Range 7 Time
        {12127, Unsigned}, // Speed Range 8 Time
        {12128, Unsigned}, // Speed Range 9 Time
        {12129, Unsigned}, // Speed Range 10 Time
        {12130, Unsigned}, // RPM Range 1 Distance
        {12131, Unsigned}, // RPM Range 2 Distance
        {12132, Unsigned}, // RPM Range 3 Distance
        {12133, Unsigned}, // RPM Range 4 Distance
        {12134, Unsigned}, // RPM Range 5 Distance
        {12135, Unsigned}, // RPM Range 6 Distance
        {12136, Unsigned}, // RPM Range 7 Distance
        {12137, Unsigned}, // RPM Range 8 Distance
        {12138, Unsigned}, // RPM Range 9 Distance
        {12139, Unsigned}, // RPM Range 10 Distance
        {12140, Unsigned}, // RPM Range 1 Fuel used
        {12141, Unsigned}, // RPM Range 2 Fuel used
        {12142, Unsigned}, // RPM Range 3 Fuel used
        {12143, Unsigned}, // RPM Range 4 Fuel used
        {12144, Unsigned}, // RPM Range 5 Fuel used
        {12145, Unsigned}, // RPM Range 6 Fuel used
        {12146, Unsigned}, // RPM Range 7 Fuel used
        {12147, Unsigned}, // RPM Range 8 Fuel used
        {12148, Unsigned}, // RPM Range 9 Fuel used
        {12149, Unsigned}, // RPM Range 10 Fuel used
        {12150, Unsigned}, // RPM Range 1 Time
        {12151, Unsigned}, // RPM Range 2 Time
        {12152, Unsigned}, // RPM Range 3 Time
        {12153, Unsigned}, // RPM Range 4 Time
        {12154, Unsigned}, // RPM Range 5 Time
        {12155, Unsigned}, // RPM Range 6 Time
        {12156, Unsigned}, // RPM Range 7 Time
        {12157, Unsigned}, // RPM Range 8 Time
        {12158, Unsigned}, // RPM Range 9 Time
        {12159, Unsigned}, // RPM Range 10 Time
        {12160, Unsigned}, // Torque Range 1 Distance
        {12161, Unsigned}, // Torque Range 2 Distance
        {12162, Unsigned}, // Torque Range 3 Distance
        {12163, Unsigned}, // Torque Range 4 Distance
        {12164, Unsigned}, // Torque Range 5 Distance
        {12165, Unsigned}, // Torque Range 6 Distance
        {12166, Unsigned}, // Torque Range 7 Distance
        {12167, Unsigned}, // Torque Range 8 Distance
        {12168, Unsigned}, // Torque Range 9 Distance
        {12169, Unsigned}, // Torque Range 10 Distance
        {12170, Unsigned}, // Torque Range 1 Fuel used
        {12171, Unsigned}, // Torque Range 2 Fuel used
        {12172, Unsigned}, // Torque Range 3 Fuel used
        {12173, Unsigned}, // Torque Range 4 Fuel used
        {12174, Unsigned}, // Torque Range 5 Fuel used
        {12175, Unsigned}, // Torque Range 6 Fuel used
        {12176, Unsigned}, // Torque Range 7 Fuel used
        {12177, Unsigned}, // Torque Range 8 Fuel used
        {12178, Unsigned}, // Torque Range 9 Fuel used
        {12179, Unsigned}, // Torque Range 10 Fuel used
        {12180, Unsigned}, // Torque Range 1 Time
        {12181, Unsigned}, // Torque Range 2 Time
        {12182, Unsigned}, // Torque Range 3 Time
        {12183, Unsigned}, // Torque Range 4 Time
        {12184, Unsigned}, // Torque Range 5 Time
        {12185, Unsigned}, // Torque Range 6 Time
        {12186, Unsigned}, // Torque Range 7 Time
        {12187, Unsigned}, // Torque Range 8 Time
        {12188, Unsigned}, // Torque Range 9 Time
        {12189, Unsigned}, // Torque Range 10 Time
        {12190, Unsigned}, // Braking Range 1 Distance
        {12191, Unsigned}, // Braking Range 2 Distance
        {12192, Unsigned}, // Braking Range 3 Distance
        {12193, Unsigned}, // Braking Range 4 Distance
        {12194, Unsigned}, // Braking Range 5 Distance
        {12195, Unsigned}, // Braking Range 6 Distance
        {12196, Unsigned}, // Braking Range 7 Distance
        {12197, Unsigned}, // Braking Range 8 Distance
        {12198, Unsigned}, // Braking Range 9 Distance
        {12199, Unsigned}, // Braking Range 10 Distance
        {12200, Unsigned}, // Braking Range 1 Fuel used
        {12201, Unsigned}, // Braking Range 2 Fuel used
        {12202, Unsigned}, // Braking Range 3 Fuel used
        {12203, Unsigned}, // Braking Range 4 Fuel used
        {12204, Unsigned}, // Braking Range 5 Fuel used
        {12205, Unsigned}, // Braking Range 6 Fuel used
        {12206, Unsigned}, // Braking Range 7 Fuel used
        {12207, Unsigned}, // Braking Range 8 Fuel used
        {12208, Unsigned}, // Braking Range 9 Fuel used
        {12209, Unsigned}, // Braking Range 10 Fuel used
        {12210, Unsigned}, // Braking Range 1 Time
        {12211, Unsigned}, // Braking Range 2 Time
        {12212, Unsigned}, // Braking Range 3 Time
        {12213, Unsigned}, // Braking Range 4 Time
        {12214, Unsigned}, // Braking Range 5 Time
        {12215, Unsigned}, // Braking Range 6 Time
        {12216, Unsigned}, // Braking Range 7 Time
        {12217, Unsigned}, // Braking Range 8 Time
        {12218, Unsigned}, // Braking Range 9 Time
        {12219, Unsigned} // Braking Range 10 Time
    };
*/
enum MessageFields: string
{
    case DEVICE_DATA = "120001";
    case GPS_DATA = "80001";
    case DRIVER_ID_1 = "990001";
    case DRIVER_ID_2 = "990002";
    case VIN = "990003";
    case VRN = "990004";
    
    case DIGITAL_INPUT_1 = "1";
    case DIGITAL_INPUT_2 = "2";
    case DIGITAL_INPUT_3 = "3";
    case DIGITAL_INPUT_4 = "4";
    case DALLAS_TEMPERATURE_ID_5 = "5";
    case DALLAS_TEMPERATURE_5 = "6";
    case DALLAS_TEMPERATURE_ID_6 = "7";
    case DALLAS_TEMPERATURE_6 = "8";
    case ANALOG_INPUT_1 = "9";
    case ANALOG_INPUT_2 = "10";
    case ANALOG_INPUT_3 = "11";
    case PROGRAM_NUMBER = "12";
    case MODULE_ID = "13";
    case ENGINE_WORKTIME = "14";
    case ENGINE_WORKTIME_COUNTED = "15";
    case TOTAL_MILEAGE_COUNTED = "16";
    case FUEL_CONSUMED_COUNTED = "17";
    case FUEL_RATE = "18";
    case ADBLUE_LEVEL_PERCENT = "19";
    case ADBLUE_LEVEL_LITERS = "20";
    case GSM_SIGNAL = "21";
    case DATA_MODE = "22";
    case ENGINE_LOAD = "23";
    case SPEED = "24";
    case ENGINE_TEMPERATURE = "25";
    case AXLE_1_LOAD = "26";
    case AXLE_2_LOAD = "27";
    case AXLE_3_LOAD = "28";
    case AXLE_4_LOAD = "29";
    case VEHICLE_SPEED = "30";
    case ACCELERATOR_PEDAL_POSITION = "31";
    case AXLE_5_LOAD = "32";
    case FUEL_CONSUMED = "33";
    case FUEL_LEVEL_LITERS = "34";
    case ENGINE_RPM = "35";
    case TOTAL_MILEAGE = "36";
    case FUEL_LEVEL_PERCENT = "37";
    case CONTROL_STATE_FLAGS = "38";
    case AGRICULTURAL_MACHINERY_FLAGS = "39";
    case HARVESTING_TIME = "40";
    case AREA_OF_HARVEST = "41";
    case MOWING_EFFICIENCY = "42";
    case GRAIN_MOWN_VOLUME = "43";
    case GRAIN_MOISTURE = "44";
    case HARVESTING_DRUM_RPM = "45";
    case GAP_UNDER_HARVESTING_DRUM = "46";
    case SECURITY_STATE_FLAGS = "47";
    case TACHO_DATA_SOURCE = "48";
    case DIGITAL_OUTPUT_3 = "50";
    case DIGITAL_OUTPUT_4 = "51";
    case TACHO_DRIVE_NO_CARD = "52";
    case DRIVER_1_CONTINUOUS_DRIVING_TIME = "56";
    case DRIVER_2_CONTINUOUS_DRIVING_TIME = "57";
    case DRIVER_1_CUMULATIVE_BREAK_TIME = "58";
    case DRIVER_2_CUMULATIVE_BREAK_TIME = "59";
    case DRIVER_1_SELECTED_ACTIVITY_DURATION = "60";
    case DRIVER_2_SELECTED_ACTIVITY_DURATION = "61";
    case DALLAS_TEMPERATURE_ID_1 = "62";
    case DALLAS_TEMPERATURE_ID_2 = "63";
    case DALLAS_TEMPERATURE_ID_3 = "64";
    case DALLAS_TEMPERATURE_ID_4 = "65";
    case EXTERNAL_VOLTAGE = "66";
    case BATTERY_VOLTAGE = "67";
    case BATTERY_CURRENT = "68";
    case DRIVER_1_CUMULATIVE_DRIVING_TIME = "69";
    case PCB_TEMPERATURE = "70";
    case GNSS_STATUS = "71";
    case DALLAS_TEMPERATURE_1 = "72";
    case DALLAS_TEMPERATURE_2 = "73";
    case DALLAS_TEMPERATURE_3 = "74";
    case DALLAS_TEMPERATURE_4 = "75";
    case FUEL_COUNTER = "76";
    case DRIVER_2_CUMULATIVE_DRIVING_TIME = "77";
    case IBUTTON = "78";
    case BRAKE_SWITCH = "79";
    case WHEEL_BASED_SPEED = "80";
    case CRUISE_CONTROL_ACTIVE = "81";
    case CLUTCH_SWITCH = "82";
    case PTO_STATE = "83";
    case ACCELERATION_PEDAL_POSITION = "84";
    case ENGINE_CURRENT_LOAD = "85";
    case ENGINE_TOTAL_FUEL_USED = "86";
    case FUEL_LEVEL = "87";
    case ENGINE_SPEED = "88";
    case AXLE_WEIGHT_1 = "89";
    case AXLE_WEIGHT_2 = "90";
    case AXLE_WEIGHT_3 = "91";
    case AXLE_WEIGHT_4 = "92";
    case AXLE_WEIGHT_5 = "93";
    case AXLE_WEIGHT_6 = "94";
    case AXLE_WEIGHT_7 = "95";
    case AXLE_WEIGHT_8 = "96";
    case AXLE_WEIGHT_9 = "97";
    case AXLE_WEIGHT_10 = "98";
    case AXLE_WEIGHT_11 = "99";
    case AXLE_WEIGHT_12 = "100";
    case AXLE_WEIGHT_13 = "101";
    case AXLE_WEIGHT_14 = "102";
    case AXLE_WEIGHT_15 = "103";
    case ENGINE_TOTAL_HOURS_OF_OPERATION = "104";
    case NUMBER_OF_RECORDS = "108";
    case SOFTWARE_VERSION_SUPPORTED = "109";
    case DIAGNOSTICS_SUPPORTED = "110";
    case REQUESTS_SUPPORTED = "111";
    case SERVICE_DISTANCE = "113";
    case DIRECTION_INDICATION = "122";
    case TACHOGRAPH_PERFORMANCE = "123";
    case HANDLING_INFO = "124";
    case SYSTEM_EVENT = "125";
    case ENGINE_COOLANT_TEMPERATURE = "127";
    case AMBIENT_AIR_TEMPERATURE = "128";
    case FUEL_RATE_SECONDARY = "135";
    case INSTANTANEOUS_FUEL_ECONOMY = "136";
    case PTO_DRIVE_ENGAGEMENT = "137";
    case ENGINE_FUEL_USED = "138";
    case GROSS_COMBINATION_VEHICLE_WEIGHT = "139";
    case BATTERY_TEMPERATURE = "141";
    case BATTERY_LEVEL_PERCENT = "142";
    case DOOR_STATUS = "143";
    case SD_STATUS = "144";
    case MANUAL_CAN_00 = "145";
    case MANUAL_CAN_01 = "146";
    case MANUAL_CAN_02 = "147";
    case MANUAL_CAN_03 = "148";
    case MANUAL_CAN_04 = "149";
    case MANUAL_CAN_05 = "150";
    case MANUAL_CAN_06 = "151";
    case MANUAL_CAN_07 = "152";
    case MANUAL_CAN_08 = "153";
    case MANUAL_CAN_09 = "154";
    case GEOFENCE_ZONE_01 = "155";
    case GEOFENCE_ZONE_02 = "156";
    case GEOFENCE_ZONE_03 = "157";
    case GEOFENCE_ZONE_04 = "158";
    case GEOFENCE_ZONE_05 = "159";
    case GEOFENCE_ZONE_06 = "160";
    case GEOFENCE_ZONE_07 = "161";
    case GEOFENCE_ZONE_08 = "162";
    case GEOFENCE_ZONE_09 = "163";
    case GEOFENCE_ZONE_10 = "164";
    case GEOFENCE_ZONE_11 = "165";
    case GEOFENCE_ZONE_12 = "166";
    case GEOFENCE_ZONE_13 = "167";
    case GEOFENCE_ZONE_14 = "168";
    case GEOFENCE_ZONE_15 = "169";
    case GEOFENCE_ZONE_16 = "170";
    case GEOFENCE_ZONE_17 = "171";
    case GEOFENCE_ZONE_18 = "172";
    case GEOFENCE_ZONE_19 = "173";
    case GEOFENCE_ZONE_20 = "174";
    case AUTO_GEOFENCE = "175";
    case DTC_ERRORS = "176";
    case NETWORK_TYPE = "178";
    case DIGITAL_OUTPUT_1 = "179";
    case DIGITAL_OUTPUT_2 = "180";
    case GNSS_PDOP = "181";
    case GNSS_HDOP = "182";
    case DRIVE_RECOGNIZE = "183";
    case DRIVER_1_WORKING_STATE = "184";
    case DRIVER_2_WORKING_STATE = "185";
    case TACHOGRAPH_OVER_SPEED = "186";
    case DRIVER_1_CARD_PRESENCE = "187";
    case DRIVER_2_CARD_PRESENCE = "188";
    
    case DRIVER_1_TIME_RELATED_STATES = "189";
    case DRIVER_2_TIME_RELATED_STATES = "190";
    case VEHICLE_SPEED_2 = "191";
    case TOTAL_DISTANCE = "192";
    case TRIP_DISTANCE = "193";
    case TIMESTAMP = "194";
    case DRIVER_1_ID_MSB = "195";
    case DRIVER_1_ID_LSB = "196";
    case DRIVER_2_ID_MSB = "197";
    case DRIVER_2_ID_LSB = "198";
    case TRIP_ODOMETER = "199";
    case SLEEP_MODE = "200";
    case LLS_1_FUEL_LEVEL = "201";
    case LLS_1_TEMPERATURE = "202";
    case LLS_2_FUEL_LEVEL = "203";
    case LLS_2_TEMPERATURE = "204";
    case GSM_CELL_ID = "205";
    case GSM_AREA_CODE = "206";
    case RFID = "207";
    case ULTRASONIC_SOFTWARE_STATUS_1 = "208";
    case ULTRASONIC_SOFTWARE_STATUS_2 = "209";
    case LLS_3_FUEL_LEVEL = "210";
    case LLS_3_TEMPERATURE = "211";
    case LLS_4_FUEL_LEVEL = "212";
    case LLS_4_TEMPERATURE = "213";
    case LLS_5_FUEL_LEVEL = "214";
    case LLS_5_TEMPERATURE = "215";
    case TOTAL_ODOMETER = "216";
    case RFID_COM2 = "217";
    case IMSI = "218";
    case CCID_PART1 = "219";
    case CCID_PART2 = "220";
    case CCID_PART3 = "221";
    case CARD_1_ISSUING_MEMBER_STATE = "222";
    case CARD_2_ISSUING_MEMBER_STATE = "223";
    case ULTRASONIC_FUEL_LEVEL_1 = "224";
    case ULTRASONIC_FUEL_LEVEL_2 = "225";
    case CNG_STATUS = "226";
    case CNG_USED = "227";
    case CNG_LEVEL = "228";
    case ADBLUE_STATUS = "229";
    case VEHICLE_REGISTRATION_NUMBER_PART1 = "231";
    case VEHICLE_REGISTRATION_NUMBER_PART2 = "232";
    case VEHICLE_IDENTIFICATION_NUMBER_PART1 = "233";
    case VEHICLE_IDENTIFICATION_NUMBER_PART2 = "234";
    case VEHICLE_IDENTIFICATION_NUMBER_PART3 = "235";
    case AXIS_X = "236";
    case AXIS_Y = "237";
    case AXIS_Z = "238";
    case IGNITION = "239";
    case MOVEMENT = "240";
    case ACTIVE_GSM_OPERATOR = "241";
    case DATA_LIMIT_HIT = "242";
    case IDLING = "243";
    case CAMERA_IMAGE_GENERATED = "244";
    case ANALOG_INPUT_4 = "245";
    case TOWING = "246";
    case CRASH_DETECTION = "247";
    case GEOFENCE_ZONE_OVER_SPEEDING = "248";
    case JAMMING = "249";
    case TRIP = "250";
    case IMMOBILIZER = "251";
    case AUTHORIZED_DRIVING = "252";
    case GREEN_DRIVING_TYPE = "253";
    case GREEN_DRIVING_VALUE = "254";
    case OVER_SPEEDING = "255";
    case CRASH_TRACE_DATA = "257";
    case ECO_MAXIMUM = "258";
    case ECO_AVERAGE = "259";
    case ECO_DURATION = "260";
    case ME_SOUND_TYPE = "288";
    case ME_PEDESTRIANS_IN_DANGER_ZONE = "289";
    case ME_PEDESTRIANS_IN_FORWARD_COLLISION_WARNING = "290";
    case ME_TIME_INDICATOR = "291";
    case ME_ERROR_VALID = "292";
    case ME_ERROR_CODE = "293";
    case ME_ZERO_SPEED = "294";

    case DRIVERS_HOURS_RULES_PRE_WARNING_TIME_DELAY = "10501"; // Drivers hours rules pre warning time delay
    case OUT_OF_SCOPE_CONDITION = "10502"; // Out Of Scope Condition
    case NEXT_CALIBRATION_DATE = "10503"; // Next Calibration Date
    case DRIVER_1_END_OF_LAST_DAILY_REST_REPORT = "10504"; // Driver 1 end of last daily rest report
    case DRIVER_1_END_OF_LAST_WEEKLY_REST_PERIOD = "10505"; // Driver 1 end of last weekly rest period
    case DRIVER_1_END_OF_SECOND_LAST_WEEKLY_REST_PERIOD = "10506"; // Driver 1 end of second last weekly rest period
    case DRIVER_1_CURRENT_DAILY_DRIVING_TIME = "10507"; // Driver 1 current daily driving time
    case DRIVER_1_CURRENT_WEEKLY_DRIVING_TIME = "10508"; // Driver 1 current weekly driving time
    case DRIVER_1_TIME_LEFT_UNTIL_NEW_DAILY_REST_PERIOD = "10509"; // Driver 1 time left until new daily rest period
    case DRIVER_1_NUMBER_OF_TIMES_9H_DAILY_DRIVING_TIME_EXCEEDS = "10510"; // Driver 1 number of times 9h daily driving time exceeds
    case DRIVER_2_END_OF_LAST_DAILY_REST_REPORT = "10511"; // Driver 2 end of last daily rest report
    case DRIVER_2_END_OF_LAST_WEEKLY_REST_PERIOD = "10512"; // Driver 2 end of last weekly rest period
    case DRIVER_2_END_OF_SECOND_LAST_WEEKLY_REST_PERIOD = "10513"; // Driver 2 end of second last weekly rest period
    case DRIVER_2_CURRENT_DAILY_DRIVING_TIME = "10514"; // Driver 2 current daily driving time
    case DRIVER_2_CURRENT_WEEKLY_DRIVING_TIME = "10515"; // Driver 2 current weekly driving time
    case DRIVER_2_TIME_LEFT_UNTIL_NEW_DAILY_REST_PERIOD = "10516"; // Driver 2 time left until new daily rest period
    case DRIVER_2_NUMBER_OF_TIMES_9H_DAILY_DRIVING_TIME_EXCEEDS = "10517"; // Driver 2 number of times 9h daily driving time exceeds
    case DRIVER_1_NAME = "10518"; // Driver 1 Name
    case DRIVER_1_SURNAME = "10519"; // Driver 1 SurName
    case DRIVER_2_NAME = "10520"; // Driver 2 Name
    case DRIVER_2_SURNAME = "10521"; // Driver 2 SurName
    case DRIVER_1_TIME_LEFT_UNTIL_NEW_WEEKLY_REST_PERIOD = "10522"; // Driver 1 Time Left Until New Weekly Rest Period
    case DRIVER_2_TIME_LEFT_UNTIL_NEW_WEEKLY_REST_PERIOD = "10523"; // Driver 2 Time Left Until New Weekly Rest Period
    case DRIVER_1_MINIMUM_DAILY_REST = "10524"; // Driver 1 Minimum Daily Rest
    case DRIVER_2_MINIMUM_DAILY_REST = "10525"; // Driver 2 Minimum Daily Rest
    case DRIVER_1_MINIMUM_WEEKLY_REST = "10526"; // Driver 1 Minimum Weekly Rest
    case DRIVER_2_MINIMUM_WEEKLY_REST = "10527"; // Driver 2 Minimum Weekly Rest
    case DRIVER_1_DURATION_OF_NEXT_BREAK_REST = "10528"; // Driver 1 Duration Of Next Break Rest
    case DRIVER_2_DURATION_OF_NEXT_BREAK_REST = "10529"; // Driver 2 Duration Of Next Break Rest
    case DRIVER_1_REMAINING_TIME_UNTIL_NEXT_BREAK_OR_REST = "10530"; // Driver 1 Remaining Time Until Next Break Or Rest
    case DRIVER_2_REMAINING_TIME_UNTIL_NEXT_BREAK_OR_REST = "10531"; // Driver 2 Remaining Time Until Next Break Or Rest
    case DRIVER_1_REMAINING_CURRENT_DRIVING_TIME = "10532"; // Driver 1 Remaining Current Driving Time
    case DRIVER_1_REMAINING_DRIVING_TIME_ON_CURRENT_SHIFT = "10533"; // Driver 1 Remaining Driving Time On Current Shift
    case DRIVER_1_REMAINING_DRIVING_TIME_OF_CURRENT_WEEK = "10534"; // Driver 1 Remaining Driving Time Of Current Week
    case DRIVER_1_OPEN_COMPENSATION_IN_THE_LAST_WEEK = "10535"; // Driver 1 Open Compensation In The Last Week
    case DRIVER_1_OPEN_COMPENSATION_IN_WEEK_BEFORE_LAST = "10536"; // Driver 1 Open Compensation In Week Before Last
    case DRIVER_1_OPEN_COMPENSATION_IN_2ND_WEEK_BEFORE_LAST = "10537"; // Driver 1 Open Compensation In 2nd Week Before Last
    case DRIVER_1_ADDITIONAL_INFORMATION = "10538"; // Driver 1 Additional Information
    case DRIVER_1_REMAINING_TIME_OF_CURRENT_BREAK_REST = "10539"; // Driver 1 Remaining Time Of Current Break Rest
    case DRIVER_1_TIME_LEFT_UNTIL_NEXT_DRIVING_PERIOD = "10540"; // Driver 1 Time Left Until Next Driving Period
    case DRIVER_1_DURATION_OF_NEXT_DRIVING_PERIOD = "10541"; // Driver 1 Duration Of Next Driving Period
    
    case TORQUE_RANGE_1_DISTANCE = "12160";
    case TORQUE_RANGE_2_DISTANCE = "12161";
    case TORQUE_RANGE_3_DISTANCE = "12162";
    case TORQUE_RANGE_4_DISTANCE = "12163";
    case TORQUE_RANGE_5_DISTANCE = "12164";
    case TORQUE_RANGE_6_DISTANCE = "12165";
    case TORQUE_RANGE_7_DISTANCE = "12166";
    case TORQUE_RANGE_8_DISTANCE = "12167";
    case TORQUE_RANGE_9_DISTANCE = "12168";
    case TORQUE_RANGE_10_DISTANCE = "12169";
    case TORQUE_RANGE_1_FUEL_USED = "12170";
    case TORQUE_RANGE_2_FUEL_USED = "12171";
    case TORQUE_RANGE_3_FUEL_USED = "12172";
    case TORQUE_RANGE_4_FUEL_USED = "12173";
    case TORQUE_RANGE_5_FUEL_USED = "12174";
    case TORQUE_RANGE_6_FUEL_USED = "12175";
    case TORQUE_RANGE_7_FUEL_USED = "12176";
    case TORQUE_RANGE_8_FUEL_USED = "12177";
    case TORQUE_RANGE_9_FUEL_USED = "12178";
    case TORQUE_RANGE_10_FUEL_USED = "12179";
    case TORQUE_RANGE_1_TIME = "12180";
    case TORQUE_RANGE_2_TIME = "12181";
    case TORQUE_RANGE_3_TIME = "12182";
    case TORQUE_RANGE_4_TIME = "12183";
    case TORQUE_RANGE_5_TIME = "12184";
    case TORQUE_RANGE_6_TIME = "12185";
    case TORQUE_RANGE_7_TIME = "12186";
    case TORQUE_RANGE_8_TIME = "12187";
    case TORQUE_RANGE_9_TIME = "12188";
    case TORQUE_RANGE_10_TIME = "12189";
    case BRAKING_RANGE_1_DISTANCE = "12190";
    case BRAKING_RANGE_2_DISTANCE = "12191";
    case BRAKING_RANGE_3_DISTANCE = "12192";
    case BRAKING_RANGE_4_DISTANCE = "12193";
    case BRAKING_RANGE_5_DISTANCE = "12194";
    case BRAKING_RANGE_6_DISTANCE = "12195";
    case BRAKING_RANGE_7_DISTANCE = "12196";
    case BRAKING_RANGE_8_DISTANCE = "12197";
    case BRAKING_RANGE_9_DISTANCE = "12198";
    case BRAKING_RANGE_10_DISTANCE = "12199";
    case BRAKING_RANGE_1_FUEL_USED = "12200";
    case BRAKING_RANGE_2_FUEL_USED = "12201";
    case BRAKING_RANGE_3_FUEL_USED = "12202";
    case BRAKING_RANGE_4_FUEL_USED = "12203";
    case BRAKING_RANGE_5_FUEL_USED = "12204";
    case BRAKING_RANGE_6_FUEL_USED = "12205";
    case BRAKING_RANGE_7_FUEL_USED = "12206";
    case BRAKING_RANGE_8_FUEL_USED = "12207";
    case BRAKING_RANGE_9_FUEL_USED = "12208";
    case BRAKING_RANGE_10_FUEL_USED = "12209";
    case BRAKING_RANGE_1_TIME = "12210";
    case BRAKING_RANGE_2_TIME = "12211";
    case BRAKING_RANGE_3_TIME = "12212";
    case BRAKING_RANGE_4_TIME = "12213";
    case BRAKING_RANGE_5_TIME = "12214";
    case BRAKING_RANGE_6_TIME = "12215";
    case BRAKING_RANGE_7_TIME = "12216";
    case BRAKING_RANGE_8_TIME = "12217";
    case BRAKING_RANGE_9_TIME = "12218";
    case BRAKING_RANGE_10_TIME = "12219";
    case SPEED_RANGE_1_DISTANCE = "12220";
    case SPEED_RANGE_2_DISTANCE = "12221";
    case SPEED_RANGE_3_DISTANCE = "12222";
    case SPEED_RANGE_4_DISTANCE = "12223";
    case SPEED_RANGE_5_DISTANCE = "12224";
    case SPEED_RANGE_6_DISTANCE = "12225";
    case SPEED_RANGE_7_DISTANCE = "12226";
    case SPEED_RANGE_8_DISTANCE = "12227";
    case SPEED_RANGE_9_DISTANCE = "12228";
    case SPEED_RANGE_10_DISTANCE = "12229";
    case SPEED_RANGE_1_FUEL_USED = "12230";
    case SPEED_RANGE_2_FUEL_USED = "12231";
    case SPEED_RANGE_3_FUEL_USED = "12232";
    case SPEED_RANGE_4_FUEL_USED = "12233";
    case SPEED_RANGE_5_FUEL_USED = "12234";
    case SPEED_RANGE_6_FUEL_USED = "12235";
    case SPEED_RANGE_7_FUEL_USED = "12236";
    case SPEED_RANGE_8_FUEL_USED = "12237";
    case SPEED_RANGE_9_FUEL_USED = "12238";
    case SPEED_RANGE_10_FUEL_USED = "12239";
    case SPEED_RANGE_1_TIME = "12240";
    case SPEED_RANGE_2_TIME = "12241";
    case SPEED_RANGE_3_TIME = "12242";
    case SPEED_RANGE_4_TIME = "12243";
    case SPEED_RANGE_5_TIME = "12244";
    case SPEED_RANGE_6_TIME = "12245";
    case SPEED_RANGE_7_TIME = "12246";
    case SPEED_RANGE_8_TIME = "12247";
    case SPEED_RANGE_9_TIME = "12248";
    case SPEED_RANGE_10_TIME = "12249";
    case RPM_RANGE_1_DISTANCE = "12250";
    case RPM_RANGE_2_DISTANCE = "12251";
    case RPM_RANGE_3_DISTANCE = "12252";
    case RPM_RANGE_4_DISTANCE = "12253";
    case RPM_RANGE_5_DISTANCE = "12254";
    case RPM_RANGE_6_DISTANCE = "12255";
    case RPM_RANGE_7_DISTANCE = "12256";
    case RPM_RANGE_8_DISTANCE = "12257";
    case RPM_RANGE_9_DISTANCE = "12258";
    case RPM_RANGE_10_DISTANCE = "12259";
    case RPM_RANGE_1_FUEL_USED = "12260";
    case RPM_RANGE_2_FUEL_USED = "12261";
    case RPM_RANGE_3_FUEL_USED = "12262";
    case RPM_RANGE_4_FUEL_USED = "12263";
    case RPM_RANGE_5_FUEL_USED = "12264";
    case RPM_RANGE_6_FUEL_USED = "12265";
    case RPM_RANGE_7_FUEL_USED = "12266";
    case RPM_RANGE_8_FUEL_USED = "12267";
    case RPM_RANGE_9_FUEL_USED = "12268";
    case RPM_RANGE_10_FUEL_USED = "12269";
    case RPM_RANGE_1_TIME = "12270";
    case RPM_RANGE_2_TIME = "12271";
    case RPM_RANGE_3_TIME = "12272";
    case RPM_RANGE_4_TIME = "12273";
    case RPM_RANGE_5_TIME = "12274";
    case RPM_RANGE_6_TIME = "12275";
    case RPM_RANGE_7_TIME = "12276";
    case RPM_RANGE_8_TIME = "12277";
    case RPM_RANGE_9_TIME = "12278";
    case RPM_RANGE_10_TIME = "12279";
    case ACCELERATOR_PEDAL_RANGE_1_DISTANCE = "12280";
    case ACCELERATOR_PEDAL_RANGE_2_DISTANCE = "12281";
    case ACCELERATOR_PEDAL_RANGE_3_DISTANCE = "12282";
    case ACCELERATOR_PEDAL_RANGE_4_DISTANCE = "12283";
    case ACCELERATOR_PEDAL_RANGE_5_DISTANCE = "12284";
    case ACCELERATOR_PEDAL_RANGE_6_DISTANCE = "12285";
    case ACCELERATOR_PEDAL_RANGE_7_DISTANCE = "12286";
    case ACCELERATOR_PEDAL_RANGE_8_DISTANCE = "12287";
    case ACCELERATOR_PEDAL_RANGE_9_DISTANCE = "12288";
    case ACCELERATOR_PEDAL_RANGE_10_DISTANCE = "12289";
    case ACCELERATOR_PEDAL_RANGE_1_FUEL_USED = "12290";
    case ACCELERATOR_PEDAL_RANGE_2_FUEL_USED = "12291";
    case ACCELERATOR_PEDAL_RANGE_3_FUEL_USED = "12292";
    case ACCELERATOR_PEDAL_RANGE_4_FUEL_USED = "12293";
    case ACCELERATOR_PEDAL_RANGE_5_FUEL_USED = "12294";
    case ACCELERATOR_PEDAL_RANGE_6_FUEL_USED = "12295";
    case ACCELERATOR_PEDAL_RANGE_7_FUEL_USED = "12296";
    case ACCELERATOR_PEDAL_RANGE_8_FUEL_USED = "12297";
    case ACCELERATOR_PEDAL_RANGE_9_FUEL_USED = "12298";
    case ACCELERATOR_PEDAL_RANGE_10_FUEL_USED = "12299";
    case ACCELERATOR_PEDAL_RANGE_1_TIME = "12300";
    case ACCELERATOR_PEDAL_RANGE_2_TIME = "12301";
    case ACCELERATOR_PEDAL_RANGE_3_TIME = "12302";
    case ACCELERATOR_PEDAL_RANGE_4_TIME = "12303";
    case ACCELERATOR_PEDAL_RANGE_5_TIME = "12304";
    case ACCELERATOR_PEDAL_RANGE_6_TIME = "12305";
    case ACCELERATOR_PEDAL_RANGE_7_TIME = "12306";
    case ACCELERATOR_PEDAL_RANGE_8_TIME = "12307";
    case ACCELERATOR_PEDAL_RANGE_9_TIME = "12308";
    case ACCELERATOR_PEDAL_RANGE_10_TIME = "12309";
}