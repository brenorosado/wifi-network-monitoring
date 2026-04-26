import { Knex } from "knex";

const BASE_POINTS: [number, number][] = [
    [-20.47254654417806, -43.916047469248035],
    [-20.47226511028245, -43.91625131711987],
    [-20.47198367587075, -43.91651953800388],
    [-20.471651984651526, -43.91791428660073],
    [-20.471199677288272, -43.91929830636221],
    [-20.471450959321313, -43.92045702058112],
    [-20.472626953767726, -43.9198132904595],
    [-20.47268726093234, -43.91931976403292],
    [-20.473471251915587, -43.918053761460406],
    [-20.47360191669007, -43.91922320451468],
    [-20.47366222347155, -43.91848291487483],
    [-20.4736220189532, -43.91749586202167],
    [-20.474566822349615, -43.918364897685855],
    [-20.47199372710862, -43.923697128859935],
    [-20.473149615073638, -43.92354692516489],
    [-20.474184881251528, -43.92303194106759],
    [-20.475109579116843, -43.92119731022098],
    [-20.47499901770884, -43.918128863307935],
    [-20.474717588343026, -43.917410031341596],
    [-20.475159834308133, -43.92290319504608],
    [-20.476144832104062, -43.9236005693445],
    [-20.476848398087018, -43.923439636814095],
    [-20.475622180999757, -43.92002786716951],
    [-20.47666748142811, -43.91942705238934],
    [-20.47729063791076, -43.9188691529506],
    [-20.476355902237692, -43.91800011728642],
    [-20.476516717382726, -43.919641629096546],
    [-20.47621518884754, -43.92084325865691],
    [-20.476948907249803, -43.921529904119964],
    [-20.47655692114265, -43.923031941070406],
    [-20.47720017986868, -43.92342890797874],
    [-20.477953995256318, -43.92165865014428],
    [-20.477773079933037, -43.91820396517155],
    [-20.477250434375083, -43.921658650157575],
    [-20.478516841695942, -43.921605005980766],
    [-20.478949025928866, -43.92355765401634],
    [-20.477310739722633, -43.92366494236995],
    [-20.47435574975075, -43.915907994424735],
    [-20.47372253022503, -43.91405190590741],
    [-20.472395776079605, -43.9120241560243],
    [-20.47308930808644, -43.91312922606642],
    [-20.473219973186126, -43.9134296334565],
    [-20.471662035906853, -43.91092981481755],
    [-20.474124574671162, -43.914717093699736],
    [-20.475321, -43.921812],
    [-20.474814, -43.920411],
    [-20.474643, -43.919805],
    [-20.474593, -43.919268],
    [-20.474564, -43.918750],
    [-20.474636, -43.917849],
    [-20.474448, -43.917478],
    [-20.474078, -43.917358],
    [-20.472041, -43.920509],
    [-20.471892, -43.920046],
    [-20.471873, -43.919318],
    [-20.471799, -43.918809],
];

const START_DATE = new Date('2019-01-01');
const END_DATE = new Date();
// ~10 meters in degrees
const JITTER = 0.0001;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randDate = (start: Date, end: Date) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const FIXA_EQUIPAMENTS = [
    { equipament: 'Radio Fixo 1', description: 'Rádio fixo setor norte', sigla: 'FIXA_NORTE_01' },
    { equipament: 'Radio Fixo 2', description: 'Rádio fixo setor sul', sigla: 'FIXA_SUL_01' },
    { equipament: 'Radio Fixo 3', description: 'Rádio fixo setor leste', sigla: 'FIXA_LESTE_01' },
];

const FIXA_IPS = ['10.10.1.1', '10.10.1.2', '10.10.1.3'];
const NON_FIXA_IP = '192.168.0.1';
const IP_SOURCE = '192.168.0.2';

export async function seed(knex: Knex): Promise<void> {
    await knex('peer').del();
    await knex('system').del();
    await knex('equipament').del();

    const equipamentRows = await knex('equipament')
        .insert(FIXA_EQUIPAMENTS)
        .returning('idequipament');

    const equipamentIds = equipamentRows.map((r: any) =>
        typeof r === 'object' ? r.idequipament : r
    );

    const systemRows = FIXA_IPS.map((ip, i) => ({
        description: `Sistema rádio fixo ${i + 1}`,
        platform: 'linux',
        uptime: 0,
        idle: 0,
        running: 1,
        bridgeup: 1,
        version: '1.0.0',
        freeMemory: 512,
        generateEntropy: 0,
        factoryMode: 0,
        networkId: i + 1,
        ipv4address: ip,
        subnet: '255.255.255.0',
        gateway: '10.10.1.254',
        dns: '8.8.8.8',
        ipv6address: '',
        encapId: 0,
        locked: 0,
        reboot: 0,
        legacyPlatform: '',
        temperature: 40,
        isRebooting: 0,
        bootCounter: 1,
        idequipament_fk: equipamentIds[i],
    }));

    await knex('system').insert(systemRows);

    const allRows: object[] = [];
    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor((END_DATE.getTime() - START_DATE.getTime()) / msPerDay);

    for (let d = 0; d <= totalDays; d++) {
        const dayStart = new Date(START_DATE.getTime() + d * msPerDay);
        const dayEnd = new Date(dayStart.getTime() + msPerDay - 1);

        const pointIndex = Math.floor(Math.random() * BASE_POINTS.length);
        const [lat, lon] = BASE_POINTS[pointIndex];
        const useFixa = pointIndex < Math.floor(BASE_POINTS.length / 2);
        const fixaIp = FIXA_IPS[pointIndex % FIXA_IPS.length];

        allRows.push({
            timestamp: randDate(dayStart, dayEnd).toISOString(),
            latitude: lat + rand(-JITTER, JITTER),
            longitude: lon + rand(-JITTER, JITTER),
            altitude: 0,
            speed: rand(0, 100),
            macsource: '00:00:00:00:00:01',
            macdestination: '00:00:00:00:00:02',
            action: 0,
            enabled: 1,
            cost: Math.round(rand(0, 200)),
            rate: 0,
            rssi: Math.round(rand(-110, 0)),
            signal_ok: 1,
            age: 0,
            stats: 0,
            encapId: 0,
            ipv4Address: useFixa ? fixaIp : NON_FIXA_IP,
            ip: IP_SOURCE,
            txpower: 0,
            version: 0,
            linkLocalAddress: '',
        });
    }

    await knex('peer').insert(allRows);
}
