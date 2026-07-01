// const firstName = "javascript";
// const piNumber = 3.14;
// const radius = 5;
// const AreaOfCircle = radius * piNumber * piNumber;


// var saldo = 5_001;
// if (saldo > 5_000) {
//     var tax = saldo * 0.01;
// }

// saldo = saldo + tax;
// console.log(saldo);

// const be = ['java', '.net']
// const fe = ['reactjs', 'flutter']

// const fullstack = [...be, ...fe];
// console.log(fullstack)

// const emp = {
//     async findAll() {
//         const result = await db.query("SELECT * FROM employees")
//         return result.rows
//     },

//     async foundEmp(email) {
//         const result = await db.query("SELECT * FROM employees WHERE email = :email", {
//             email
//         });
//         return result.rows
//     }
// }

// const listOfEmp = emp.findAll()
// const foundEmp = emp.foundEmp()

class Employee {
    emp = [];

    create(name, email, age) {
        this.emp.push({
            name,
            email,
            age
        })
    }

    findAll() {
        return this.emp;
    }

    foundEmpByEmail(email) {
        const result = this.emp.find((value) => value.email.includes(email))
        if(!result) {
            return "Email not found!"
        }
        return result
    }
}

const emp = new Employee()

emp.create("Wahyudi", "wahyudi@gmail.com", 20)
emp.create("lisa", "lisa@gmail.com", 20)
emp.create("rukia", "rukia@gmail.com", 20)

const listOfEmp = emp.findAll()
const foundEmpByEmail = emp.foundEmpByEmail("wahyudi@gmail")

console.log(listOfEmp)
console.log(foundEmpByEmail)

