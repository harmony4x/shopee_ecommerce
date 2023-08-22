'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt")
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyRefreshToken } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, ForbiddenError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const keytokenModel = require("../models/keytoken.model");


class AccessService {

    static handlerRefreshToken = async (refreshToken) => {

        // check xem token nay da duoc su dung hay chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)

        // neu da duoc su dung
        if (foundToken) {
            // decode xem user nay la ai?
            const { userId, email } = await verifyRefreshToken(refreshToken, foundToken.privateKey)

            // xoa tat ca token cua user do trong keyStore
            await KeyTokenService.deleteById(userId)
            throw new ForbiddenError('Something went wrong! Please relogin')
        }

        // neu khong co thi check tiep
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop not registered')

        // neu co refreshToken thi verify no
        const { userId, email } = await verifyRefreshToken(refreshToken, holderToken.privateKey)

        // check userId
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        // create 1 cap token moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)


        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken //token da duoc su dung de lay token moi
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {

        const delKey = await KeyTokenService.removeKeyId(keyStore._id)
        console.log({ delKey })
        return delKey
    }

    static login = async ({ email, password, refreshToken = null }) => {
        /* 
            1. check email in db
            2. match password 
            3, create AT vs RT and save
            4. general token
            5. get data return login
            
        */

        // 1.
        const foundShop = await findByEmail({ email })

        if (!foundShop) throw new BadRequestError('Shop not registered')

        // 2.
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')

        // 3.
        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        // 4.
        const { _id: userId } = foundShop._id

        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)
        const result = await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId

        })
        console.log(result)
        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        const roles = 'admin'
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error Shop already exists')
        }

        const passswordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passswordHash, roles
        })

        if (newShop) {

            const publicKey = crypto.randomBytes(64).toString('hex')
            const privateKey = crypto.randomBytes(64).toString('hex')

            console.log({ privateKey, publicKey }) // save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                // await newShop.deleteOne()
                return {
                    code: 'xxxx',
                    message: 'Error create keyStore',
                    status: 'error'
                }
            }



            // create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log(`Create Token Success::`, tokens)
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }


    }
}

module.exports = AccessService