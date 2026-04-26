import { Request, Response } from 'express';
const peerService = require('../service/PeerService');
const knex = require('../db/db');

class PeerController {
    async createPeer(request: Request, response: Response) {
        try {
            const peerid = await peerService.createPeer({
                timestamp: `${request.body.data} ${request.body.hora}`,
                latitude: request.body.lat,
                longitude: request.body.lon,
                altitude: request.body.alt,
                speed: request.body.radio,
                cost: request.body.custo,
                rssi: request.body.rssi,
                ipv4Address: request.body.ipv4Address,
                ip: request.body.ip,
                macsource: "",  // Adicione a lógica para obter esses valores se necessário
                macdestination: "",  // Adicione a lógica para obter esses valores se necessário
                action: 0,  // Modifique conforme necessário
                enabled: 1,  // Modifique conforme necessário
                rate: 0,  // Modifique conforme necessário
                signal_ok: 0,  // Modifique conforme necessário
                age: 0,  // Modifique conforme necessário
                stats: 0,  // Modifique conforme necessário
                encapId: 0,  // Modifique conforme necessário
                txpower: 0,  // Modifique conforme necessário
                version: 0,  // Modifique conforme necessário
                linkLocalAddress: ""  // Adicione a lógica para obter esse valor se necessário
            });
            response.status(201).json(peerid);
        } catch (err) {
            console.error(err);
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async show(request: Request, response: Response) {
        const { id, startAt, endAt } = request.body;
        const { type } = request.query;
        let query;

        if (id) {
            query = knex('peer').where('idpeer', id).first();
        } else if (type != null && type == 'cost') {
            query = knex('peer').whereNotNull('cost');
        } else if (type != null && type == 'rssi') {
            query = knex('peer').whereNotNull('rssi');
        } else {
            query = knex('peer').select('*');
        }

        if (startAt) query = query.where('timestamp', '>=', startAt);
        if (endAt) query = query.where('timestamp', '<=', endAt);

        const peer = await query;

        if (!peer) {
            return response.status(400).json({ message: 'mac not found.' });
        }

        return response.json(peer);
    }

    async getPeersForRssi(request: Request, response: Response) {
        const { startAt, endAt } = request.body;

        let query = knex('peer')
            .select('peer.*')
            .join('system', 'peer.ipv4Address', 'system.ipv4address')
            .join('equipament', 'system.idequipament_fk', 'equipament.idequipament')
            .whereLike('equipament.sigla', 'FIXA%');

        if (startAt) query = query.where('peer.timestamp', '>=', startAt);
        if (endAt) query = query.where('peer.timestamp', '<=', endAt);

        const peers = await query;

        return response.json(peers);
    }

    async update(request: Request, response: Response) {
        const { id } = request.params;
        const body = request.body;
        try {
            const peer = await knex('peer').where('idpeer', id).update(body);
            if (!peer) {
                return response.status(400).json({ message: 'peer not updated.' });
            }
            return response.json(peer);
        } catch (err) {
            console.error(err);
        }
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const peer = await knex('peer').where('idpeer', id).del();

        if (!peer) {
            return response.status(400).json({ message: 'peer not found.' });
        }

        return response.json({ message: 'peer deletado' });
    }

}

module.exports = new PeerController();