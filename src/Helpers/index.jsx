import { deleteCookie } from '../Hooks/cookie'
import axios from 'axios'
import Cookies from 'js-cookie'
import { confirmDialog } from 'primereact/confirmdialog'

// FETCHING TOKEN FROM COOKIE
export const token = Cookies.get('IPD')

export const request = async (props) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios?.[props?.method](
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        headers: {
          Authorization: `${token}`,
        },
        withCredentials: true,
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      // window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`);
      console.error('Unauthorized: Redirecting to login page')
    }
    throw error
  }
}

export const getRequest = async (url) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      console.error('Unauthorized: Redirecting to login page')
    }
    throw error
  }
}

export const postRequest = async (props) => {
  console.log(import.meta.env)
  console.log("Base url", import.meta.env.VITE_API_BASE_URL);
  
  const token = Cookies.get('IPD')
  try {
    const response = await axios?.post(
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`)
      console.error('Unauthorized: Redirecting to login page')
    }
    throw error
  }
}

export const putRequest = async (props) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios?.put(
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`)
      console.error('Unauthorized: Redirecting to login page')
    }
    // Handle other errors here
    throw error // Re-throw the error to allow the caller to handle it
  }
}

export const patchRequest = async (props) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios?.patch(
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`)
      console.error('Unauthorized: Redirecting to login page')
    }
    // Handle other errors here
    throw error // Re-throw the error to allow the caller to handle it
  }
}
export const deleteRequest = async (url) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`)
      console.error('Unauthorized: Redirecting to login page')
    }
    // Handle other errors here
    throw error // Re-throw the error to allow the caller to handle it
  }
}

export const deleteRequest1 = async (url) => {
  const token = Cookies.get('IPD')
  try {
    const confirmed = await confirmDeletion('Are you sure you want to delete this item?')
    if (confirmed) {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        headers: {
          Authorization: `${token}`,
        },
      })

      return response
    } else {
      throw 'An error occurred while deleting the item'
    }
  } catch (error) {
    if (error?.response?.status) {
      if (error.response.status === 401) {
        deleteCookie('IPD')
        console.error('Unauthorized: Redirecting to login page')
      }
    }
    // Handle other errors here
    throw error // Re-throw the error to allow the caller to handle it
  }
}

export const deleteRequestwithbody = async (props) => {
  const token = Cookies.get('IPD')

  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}${props.url}`, {
      headers: {
        Authorization: `${token}`,
      },
      data: props.cred, // body for delete request
    })

    return response
  } catch (error) {
    if (error?.response?.status === 401) {
      deleteCookie('IPD')
      if (typeof window !== 'undefined') {
        window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`
      }
      console.error('Unauthorized: Redirecting to login page')
    }

    throw error
  }
}

export const noTokenGetRequest = async (url) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    withCredentials: true,
  })
  return response
}

export const noTokenPostRequest = async (props) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
    props?.cred,
    {
      withCredentials: true,
    },
  )
  return response
}

export const noTokenPutRequest = async (props) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
    props?.cred,
    {
      withCredentials: true,
    },
  )
  return response
}

export const noTokenPatchRequest = async (props) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
    props?.cred,
    {
      withCredentials: true,
    },
  )
  return response
}

export const noTokenDeleteRequest = async (url) => {
  const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    withCredentials: true,
  })
  return response
}

export const fileUpload = async (props) => {
  const token = Cookies.get('IPD')
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
        // withCredentials: true,
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      deleteCookie('IPD')
      window != undefined && (window.location.href = `${import.meta.env.VITE_SIGNUP_URL}`)
      console.error('Unauthorized: Redirecting to login page')
    }
    // Handle other errors here
    throw error // Re-throw the error to allow the caller to handle it
  }
}

export const noTokenfileUpload = async (props) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}${props?.url}`,
      props?.cred,
      {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      },
    )

    return response
  } catch (error) {
    if (error.response.status === 401) {
      console.error('Unauthorized: Redirecting to login page')
    }

    throw error
  }
}

// Function to display a confirmation dialog
const confirmDeletion = async (message) => {
  return new Promise((resolve) => {
    const accept = () => resolve(true)
    const reject = () => resolve(false)

    // Assuming `confirmDialog` is a function that displays a confirmation dialog
    confirmDialog({
      message: message,
      header: 'Confirm Deletion',
      icon: 'warning',
      acceptClassName: 'p-button-danger', // Example class for styling
      acceptText: 'Delete', // Example text for the confirm button
      accept: accept,
      reject: reject,
    })
  })
}
