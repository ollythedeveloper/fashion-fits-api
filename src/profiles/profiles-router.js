const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const ProfilesService = require('./profiles-service')
const { profile } = require('console')

const profilesRouter = express.Router()
const bodyParser = express.json()

const serializeProfile = profile => ({
    id: profile.id,
    profileTypeId: profile.profileTypeId,
    regionId: profile.regionId,
    fit: xss(profile.fit),
    category: xss(profile.category),
    numberSizes: xss(profile.numberSizes),
    results: xss(profile.results)
})

profilesRouter
    .route('/')
    .get((req, res, next) => {
        ProfilesService.getAllProfiles(req.app.get('db'))
            .then(profiles => {
                res.json(profiles.map(serializeProfile))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['fit', 'category', 'numberSizes', 'results']) {
            if (!req.body[field]) {
                logger.error(`'${field}' is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        const { fit, category, numberSizes, results } = req.body;

        const newProfile = { fit, category, numberSizes, results }

        ProfilesService.insertProfile(
            req.app.get('db'),
            newProfile
        )
            .then(profile => {
                logger.info(`Region with id ${profile.id} created`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${profile.id}`))
                    .json(serializeProfile(profile))
            })
            .catch(next)
    })

profilesRouter
    .route('/:profile_id')
    .all((req, res, next) => {
        const { profile_id } = req.params
        ProfilesService.getById(
            req.app.get('db'),
            profile_id
        )
            .then(profile => {
                //make sure profile is found
                if (!profile) {
                    return res.status(404).json({
                        error: { message: `Profile Not Found` }
                    })
                }
                res.profile = profile //save the profile for the next middleware
                next() //call next so the next middleware happens
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.profile.id,
            profileTypeId: res.profile.profileTypeId,
            regionId: res.profile.regionId,
            fit: xss(res.profile.fit), //sanitize fit
            category: xss(res.profile.category), //sanitize category
            numberSizes: xss(res.profile.numberSizes), //sanitize numberSizes
            results: xss(res.profile.results) //sanitize results
        })
    })
    .delete((req, res, next) => {
        const { profile_id } = req.params
        ProfilesService.deleteProfile(
            req.app.get('db'),
            req.params.profile_id
        )
            .then(() => {
                logger.info(`Profile with id ${profile_id} deleted`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { fit, category, numberSizes, results } = req.body
        const profileToUpdate = { fit, category, numberSizes, results }

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'fit', 'category', 'numberSizes' or 'results'`
                }
            })
        }

        ProfilesService.updateProfile(
            req.app.get('db'),
            req.params.profile_id,
            profileToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = profilesRouter