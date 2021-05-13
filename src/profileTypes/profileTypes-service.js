const ProfileTypesService = {
    getAllProfileTypes(knex) {
        return knex.select('*').from('profile-types')
    },
    insertProfileType(knex, newProfileType) {
        return knex
            .insert(newProfileType)
            .into('profile-types')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('profile-types').select('*').where('id', id).first()
    },
    deleteProfileType(knex, id) {
        return knex('profile-types')
            .where({ id })
            .delete()
    },
    updateProfileType(knex, id, newProfileTypeFields) {
        return knex('profile-types')
            .where({ id })
            .update(newProfileTypeFields)
    }
}

module.exports = ProfileTypesService