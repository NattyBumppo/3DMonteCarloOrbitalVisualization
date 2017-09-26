import random
import csv

point_data_filename = 'point_data_fake.csv'
group_data_filename = 'group_data_fake.csv'

num_points = 60
num_timestamps = 100
min_pos_on_axis = -1000
max_pos_on_axis = 1000

times = []
t = 0
for t_idx in range(num_timestamps):
    t += random.random()
    times.append(t)

with open(point_data_filename, 'wb') as point_data_file:
    fieldnames = ['id', 't', 'rx', 'ry', 'rz', 'vx', 'vy', 'vz', 'ux', 'uy', 'uz']
    csv_writer = csv.DictWriter(point_data_file, fieldnames=fieldnames)

    csv_writer.writeheader()

    # ID, t, rx, ry, rz, vx, vy, vz, ux, uy, uz,
    # where ID=sample number of Monte-Carlo, r* = position, v*=velocity, u*=thrust (control input)
    for i, val in enumerate(range(num_points)):
        last_point_set = False
        for time in times:
            point = {}
            point['id'] = i
            point['t'] = time

            if last_point_set:
                point['rx'] = last_point['rx'] + random.randrange(min_pos_on_axis, max_pos_on_axis) / 100.0
                point['ry'] = last_point['ry'] + random.randrange(min_pos_on_axis, max_pos_on_axis) / 100.0
                point['rz'] = last_point['rz'] + random.randrange(min_pos_on_axis, max_pos_on_axis) / 100.0
            else:
                point['rx'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
                point['ry'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
                point['rz'] = random.randrange(min_pos_on_axis, max_pos_on_axis)

            point['vx'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
            point['vy'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
            point['vz'] = random.randrange(min_pos_on_axis, max_pos_on_axis)

            point['ux'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
            point['uy'] = random.randrange(min_pos_on_axis, max_pos_on_axis)
            point['uz'] = random.randrange(min_pos_on_axis, max_pos_on_axis)

            csv_writer.writerow(point)

            last_point = point
            last_point_set = True

# t,rx,ry,rz,vx,vy,vz, c11, c12, c13, ..., c16, c22, c23, ..., c26, c33, c34, ..., c36, c44, ..., c66
# where r*=Mean position, v*=Mean velocity, c**= Covariance (symmetric matrix)
