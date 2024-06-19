import { Request, Response } from 'express'
import generateErrorResponse from '../utils/generateErrorResponse'
import { get } from 'lodash'
import { AddressModel } from '../db/addresses'
import {
  createAddressSchema,
  updateAddressSchema,
} from '../schemas/addressSchema'
import mongoose from 'mongoose'

async function createAddressHandler(req: Request, res: Response) {
  try {
    const parsedBody = createAddressSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    const { neighborhood, number, street, complement } = parsedBody.data

    const currUserId = get(req, 'user._id') as unknown as string

    const address = await AddressModel.create({
      user: currUserId,
      neighborhood,
      number,
      street,
      complement,
    })

    res.status(201).json(address)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function updateAddressHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return generateErrorResponse({
        error: new Error('Invalid address id'),
        res,
        code: 400,
      })
    }

    const parsedBody = updateAddressSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Parameters'),
        res,
        code: 400,
      })
    }

    const { neighborhood, number, street, complement } = parsedBody.data

    const hasAddressToUpdate = await AddressModel.findById(id)

    if (!hasAddressToUpdate) {
      return generateErrorResponse({
        error: new Error('Address not found'),
        res,
        code: 400,
      })
    }

    await AddressModel.findByIdAndUpdate(id, {
      ...(street && { street }),
      ...(number && { number }),
      ...(neighborhood && { neighborhood }),
      ...(complement && { complement }),
    })

    res.status(201).json({ message: 'Address updated' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function deleteAddressHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return generateErrorResponse({
        error: new Error('Invalid address id'),
        res,
        code: 400,
      })
    }

    const hasAddressToDelete = await AddressModel.findById(id)

    if (!hasAddressToDelete) {
      return generateErrorResponse({
        error: new Error('Address not found'),
        res,
        code: 400,
      })
    }

    await AddressModel.findByIdAndDelete(id)

    res.status(201).json({ message: 'Address deleted' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function listAddressesHandler(req: Request, res: Response) {
  try {
    const user = get(req, 'user._id') as unknown as string

    const addresses = await AddressModel.find({ user })

    res.status(201).json(addresses)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export {
  listAddressesHandler,
  createAddressHandler,
  deleteAddressHandler,
  updateAddressHandler,
}
