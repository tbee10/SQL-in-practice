require('dotenv').config();
const {CONNECTION_STRING} = process.env;
const res = require('express/lib/response');
const Sequelize = require('sequelize');

// you wouldn't want to rejectUnauthorized in a production app, but it's great for practice
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

let nextEmp = 5

module.exports = {
    getAllClients: (req, res) => {
        sequelize.query(`SELECT * FROM cc_clients AS c 
        JOIN cc_users AS u ON c.user_id = u.user_id
        WHERE u.user_id = ${userID};`)
        .then((dbResult) => {
            console.log(dbResult);
            res.status(200).send(dbResult[0]);        
        })
        .catch((err) => console.log(err));
    },

    getPendingAppointments: (req, res) => {
        sequelize.query(`select * from cc_appointments
        where approved = false
        order by date desc;`)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch((err) => console.log(err))
    },


    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    getPastAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.notes, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = true
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

   { approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`update cc_appointments set approved = true
        where appt_id = ${apptId};
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },

    completeAppointment: (req, res) => {
        let {apptId} = req.body
        sequelize.query(`update cc_appintments set complete = true
        where appt_id = ${apptId};`)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    }
    
}